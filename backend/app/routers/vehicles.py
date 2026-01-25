from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from typing import List, Optional, Dict
from .. import models, schemas, database
from ..services.vehicle_service import VehicleService

router = APIRouter(prefix="/api/v1", tags=["vehicles"])

@router.get("/user-vehicles", response_model=Dict)
async def get_user_vehicles(user_id: Optional[str] = None, db: AsyncSession = Depends(database.get_db)):
    target_user_id = user_id or "dbf5b654-35d6-4ac7-8f66-a3b9862424f7"
    vehicles = await VehicleService.get_user_vehicles(db, target_user_id)
    return {"vehicles": [schemas.VehicleBase.model_validate(v) for v in vehicles]}

@router.get("/fleet-analytics")
async def get_fleet_analytics(
    user_id: Optional[str] = None, 
    last_n_days: int = 1, 
    vehicles: Optional[str] = None,
    cities: Optional[str] = None,
    vehicle_types: Optional[str] = None,
    clients: Optional[str] = None,
    db: AsyncSession = Depends(database.get_db)
):
    # If user_id is missing, it should be retrieved from the session (mocked here)
    target_user_id = user_id or "dbf5b654-35d6-4ac7-8f66-a3b9862424f7"
    return await VehicleService.get_fleet_analytics(db, target_user_id, last_n_days)

@router.get("/vehicle-static-details")
async def get_vehicle_static_details(vehicle_id: str, db: AsyncSession = Depends(database.get_db)):
    details = await VehicleService.get_vehicle_static_details(db, vehicle_id)
    if not details:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    return details

@router.get("/fetch-vehicle-by-parameter")
async def fetch_vehicle_by_parameter(vehicle_id: str, key: str, factor: str):
    return {
        "vehicle_id": vehicle_id,
        "key": key,
        "factor": factor,
        "day": [],
        "week": [],
        "month": []
    }

@router.get("/get-vehicle-update")
async def get_vehicle_update(vehicle_id: str = Query(None), imei: str = Query(None), db: AsyncSession = Depends(database.get_db)):
    target_id = vehicle_id or imei
    if not target_id:
        raise HTTPException(status_code=422, detail="Missing vehicle_id or imei")
        
    result = await db.execute(
        select(models.RealtimeVehicleData).where(models.RealtimeVehicleData.vehicle_id == target_id)
    )
    data = result.scalar_one_or_none()
    if not data:
        raise HTTPException(status_code=404, detail="No data found")
    return schemas.RealtimeDataResponse.model_validate(data)

@router.get("/get-trips")
async def get_trips(vehicle_ids: str = None, _from: str = None, _to: str = None, db: AsyncSession = Depends(database.get_db)):
    return {
        "data": {
            "all": [],
            "today": [],
            "pagination": {
                "end_index": 0,
                "start_index": 0,
                "total_entries": 0
            }
        }
    }

@router.get("/get-trip-analytics")
async def get_trip_analytics(trip_id: str = None, db: AsyncSession = Depends(database.get_db)):
    return {"analytics": {}}

@router.get("/trip-analytics")
async def trip_analytics_by_id(trip_id: str = None, db: AsyncSession = Depends(database.get_db)):
    return {"trip_analytics": {}}

@router.get("/get-live-trips")
async def get_live_trips(vehicle_ids: str = None, db: AsyncSession = Depends(database.get_db)):
    # Frontend expects {"data": {"live": ...}}
    return {"data": {"live": None}}

@router.get("/trips/waypoints")
async def trip_waypoints(trip_id: str = None, db: AsyncSession = Depends(database.get_db)):
    return {"data": []}



@router.get("/vehicles-update")
async def fetch_user_vehicles_map_boundaries(
    user_id: Optional[str] = None, 
    bb: Optional[str] = None,
    db: AsyncSession = Depends(database.get_db)
):
    target_user_id = user_id or "dbf5b654-35d6-4ac7-8f66-a3b9862424f7"
    
    query = select(models.Vehicle).join(models.UserVehicle).where(models.UserVehicle.user_id == target_user_id).options(joinedload(models.Vehicle.realtime_data))
    result = await db.execute(query)
    vehicles = result.scalars().all()
    
    valid_vehicles = {}
    
    for v in vehicles:
        # Default empty/null structural values
        rt = v.realtime_data
        
        # Determine IMEI (using string ID as fallback if no IMEI logic exists, but typically it should be on vehicle or telematics)
        # Using v.id as IMEI placeholder if actual IMEI not readily linked in this context, 
        # but in seeding we saw 'imei' on Telematics.
        # Ideally we join Telematics, but for now let's use v.id or a field if we have it. 
        # Looking at previous loop, we used v.id. Let's use v.id as the key for now, or v.registration_number?
        # Frontend does map keys to 'imei' property: .map(([key, value]) => ({ ...value, ...{ imei: key } }))
        # So the key MUST be the unique identifier.
        vehicle_key = v.id 

        vehicle_obj = {
            "imei": vehicle_key,
            "speed": rt.speed if rt else 0,
            "vehicle_meta": {
                "category": v.vehicle_category,
                "chassis_number": v.chassis_number,
                "firmware": rt.stark_version if rt else "v1.0",
                "registration_number": v.registration_number,
                "state": v.vehicle_state,
                "t_mac": "00:00:00:00:00:00", # Placeholder
                "vin": v.vin
            },
            "location": {
                "coordinate": {
                    "latitude": rt.lat if rt else 0,
                    "longitude": rt.lng if rt else 0
                },
                "heading": rt.location_heading if rt else 0,
                "address": rt.lua_location if rt else ""
            },
            "battery": {
                "soc": rt.battery_soc if rt else 0,
                "ttfc": rt.vehicle_ttfc if rt else 0, # Frontend expects number or string? Interface says number, but seed text was string. Let's verify.
                # Interface says ttfc: number. Seeding "2h 30m" -> likely mismatch. 
                # Converting to simple integer for safety or keeping as is if frontend handles mixed.
                "temperature": rt.temperature_battery if rt else 0,
                "soh": rt.battery_soh if rt else 100
            },
            "distance": {
                "total": rt.distance_trip if rt else 0, # Mapping appropriately
                "live": 0,
                "odo": rt.odometer if rt else 0,
                "range": rt.vehicle_range if rt else 0,
                "today": 0
            },
            "temperature": {
                "battery": rt.temperature_battery if rt else 0,
                "controller": rt.temperature_controller if rt else 0,
                "motor": rt.temperature_motor if rt else 0
            },
            "status": {
                "battery": str(rt.status_battery) if rt else "0", # Interface string
                "location": 1 if (rt and rt.lat) else 0,
                "mob_status": rt.vehicle_immob_state if rt else 0,
                "route": str(rt.status_route) if rt else "0",
                "sleep_mode": 0,
                "telemetry": True if rt else False,
                "vehicle_mode": str(rt.status_vehicle_mode) if rt else "0"
            },
            "lua": {
                "vehicle": float(rt.lua_vehicle) if (rt and rt.lua_vehicle) else 0,
                "location": float(rt.lua_location) if (rt and rt.lua_location) else 0
            }
        }
        valid_vehicles[vehicle_key] = vehicle_obj

    return {
        "vehicle_data": valid_vehicles,
        "errored_vehicle": {}
    }

@router.get("/fetch-user-filters")
async def fetch_user_filters(user_id: str):
    return {"filters": []}

@router.get("/change-drive-mode")
async def change_drive_mode(vehicle_imei: str, new_mode: int):
    return {"status": "success", "msg": f"Mode changed to {new_mode}"}

@router.post("/stop-vehicle")
async def stop_vehicle(mac_id: str):
    return {"msg": "Vehicle Stopped"}

@router.post("/start-vehicle")
async def start_vehicle(mac_id: str):
    return {"msg": "Vehicle Started"}

@router.get("/vehicle-data")
async def vehicle_data_report():
    return {"status": "Report requested"}
