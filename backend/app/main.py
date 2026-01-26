from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .routers import auth, vehicles, telemetry, common, reports, charging, url, commands
import time
import json
import random
import os

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
                company_name="Tesla"
            )
            db.add(user)
            await db.flush()
            
            import random
            
            # Load sample data
            data_dir = os.path.join(os.path.dirname(__file__), "..", "data", "samples")

            # Seed Vehicles from JSON
            vehicle_data = []
            try:
                with open(os.path.join(data_dir, "vehicles.json"), "r") as f:
                    vehicle_data = json.load(f)
            except Exception as e:
                print(f"Error loading vehicles.json: {e}")

            for i, v_data in enumerate(vehicle_data):
                vehicle = models.Vehicle(
                    id=v_data["id"],
                    registration_number=v_data["registration_number"],
                    chassis_number=v_data["chassis_number"],
                    vin=v_data["vin"],
                    vehicle_category=v_data["vehicle_category"],
                    vehicle_state=v_data["vehicle_state"]
                )
                db.add(vehicle)
                
                user_vehicle = models.UserVehicle(user_id=user.user_id, vehicle_id=vehicle.id)
                db.add(user_vehicle)
                
                # Generate pseudo-IMEI (unique)
                imei = f"12345678901234{i+1}"
                
                telematics = models.Telematics(imei=imei, unique_id=f"{v_data['id']}-unique", model_name="FMC-125")
                db.add(telematics)
                await db.flush()
                
                links = models.VehicleTelemetry(vehicle_id=vehicle.id, telemetry_id=telematics.id)
                db.add(links)
                
                realtime = models.RealtimeVehicleData(
                    vehicle_id=vehicle.id, 
                    battery_soc=random.uniform(20.0, 95.0),
                    battery_soh=98.5,
                    battery_voltage=48.0,
                    speed=0.0, 
                    lat=v_data.get("lat", 0.0),
                    lng=v_data.get("lng", 0.0),
                    distance_trip=5.5,
                    vehicle_range=random.uniform(250.0, 350.0),
                    vehicle_ttfc="1h 30m",
                    stark_version="1.2.0",
                    vehicle_immob_state=0,
                    status_battery=1,
                    status_route=0,
                    status_vehicle_mode=0,
                    location_heading=random.uniform(0, 360),
                    lua_location=str(time.time()),
                    lua_vehicle=str(time.time()),
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
            
            # Seed Charging Hubs from JSON
            hub_data = []
            try:
                with open(os.path.join(data_dir, "charging_hubs.json"), "r") as f:
                    hub_data = json.load(f)
            except Exception as e:
                print(f"Error loading charging_hubs.json: {e}")

            socket_types = ["2Phase", "3Phase"]
            power_types = ["AC_001", "DC_001", "DC_001_FAST"]

            for h_data in hub_data:
                hub = models.ChargingHub(
                    hub_id=h_data["hub_id"],
                    hub_name=h_data["hub_name"],
                    provider=h_data["provider"],
                    total_slots=h_data["total_slots"],
                    lat=h_data["lat"],
                    lng=h_data["lng"],
                    address_area=h_data.get("address_area", ""),
                    address_city=h_data.get("address_city", ""),
                    address_country=h_data.get("address_country", ""),
                    address_pin=h_data.get("address_pin", ""),
                    address_premise=h_data.get("address_premise", ""),
                    address_state=h_data.get("address_state", ""),
                    address_street=h_data.get("address_street", "")
                )
                db.add(hub)
                await db.flush()
                
                # Seed Connectors (Sockets)
                for s_i in range(1, h_data["total_slots"] + 1):
                    connector = models.ChargingConnector(
                        hub_id=hub.hub_id,
                        format=random.choice(socket_types),
                        power_type=random.choice(power_types),
                        max_voltage=400.0,
                        max_amperage=32.0,
                        max_electric_power=150.0,
                        standard="TESLA",
                        tariff_id="TARIFF-001",
                        lua=str(time.time())
                    )
                    db.add(connector)
            
            await db.commit()
            print("Architecture-verified seeding completed for EV Tracker.")
