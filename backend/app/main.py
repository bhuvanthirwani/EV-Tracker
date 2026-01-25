from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .routers import auth, vehicles, telemetry, common, reports, charging, url, commands

app = FastAPI(title="Vehicle Dashboard Production API", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(common.router)
app.include_router(auth.router)
app.include_router(vehicles.router)
app.include_router(telemetry.router)
app.include_router(reports.router)
app.include_router(charging.router)
app.include_router(url.router)
app.include_router(commands.router)

@app.on_event("startup")
async def startup():
    async with database.engine.begin() as conn:
        await conn.run_sync(models.Base.metadata.create_all)
    
    # Seeding Logic (same as before)
    from sqlalchemy import select
    async with database.SessionLocal() as db:
        result = await db.execute(select(models.User).where(models.User.username == "testuser"))
        if not result.scalar_one_or_none():
            user = models.User(
                user_id="dbf5b654-35d6-4ac7-8f66-a3b9862424f7",
                username="testuser",
                email="test@example.com",
                full_name="Test User",
                password="password123",
                phone="1234567890",
                is_active=True,
                is_verified=True,
                company_name="EV Tracker"
            )
            db.add(user)
            await db.flush()
            
            vehicle = models.Vehicle(
                id="vh-001",
                registration_number="ABC-1234",
                chassis_number="CH-001",
                vin="VIN-001",
                vehicle_category="ELECTRIC",
                vehicle_state="ACTIVE"
            )
            db.add(vehicle)
            
            user_vehicle = models.UserVehicle(user_id=user.user_id, vehicle_id=vehicle.id)
            db.add(user_vehicle)
            
            telematics = models.Telematics(imei="123456789012345", unique_id="vh-001-unique", model_name="FMC-125")
            db.add(telematics)
            await db.flush()
            
            links = models.VehicleTelemetry(vehicle_id=vehicle.id, telemetry_id=telematics.id)
            db.add(links)
            
            realtime = models.RealtimeVehicleData(
                vehicle_id=vehicle.id, 
                battery_soc=100.0,
                battery_soh=98.5,
                battery_voltage=48.0,
                speed=0.0, 
                lat=12.9716, 
                lng=77.5946,
                distance_trip=5.5,
                vehicle_range=85.0,
                vehicle_ttfc="2h 30m",
                stark_version="1.2.0",
                vehicle_immob_state=0,
                status_battery=1,
                status_route=0,
                status_vehicle_mode=0,
                location_heading=90.0,
                lua_location="1761924170.0",
                lua_vehicle="1726451273.0",
                prediction_range_current=85.0,
                prediction_range_economy=90.0,
                prediction_range_formula=82.0,
                prediction_range_sports=75.0,
                temperature_ambient=25.0,
                temperature_battery=30.0,
                temperature_controller=35.0,
                temperature_motor=40.0
            )
            db.add(realtime)
            
            # Seeding Charging Hubs
            hub = models.ChargingHub(
                hub_id="hub-001",
                hub_name="EV Charging Station - Williamsville",
                provider="EV Tracker",
                total_slots=5,
                lat=42.8865,
                lng=-78.8784,
                address_area="Williamsville",
                address_city="Buffalo",
                address_country="USA",
                address_pin="14221",
                address_premise="123 Main Street",
                address_state="New York",
                address_street="Main Street"
            )
            db.add(hub)
            await db.flush()
            
            connector = models.ChargingConnector(
                hub_id=hub.hub_id,
                format="Socket",
                power_type="AC_3_PHASE",
                max_voltage=400.0,
                max_amperage=32.0,
                max_electric_power=22.0,
                standard="IEC_62196_T2",
                tariff_id="TARIFF-001",
                lua="123456789.0"
            )
            db.add(connector)
            
            await db.commit()
            print("Architecture-verified seeding completed for EV Tracker.")
