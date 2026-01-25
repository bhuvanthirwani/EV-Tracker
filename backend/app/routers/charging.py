from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from .. import database

router = APIRouter(prefix="/api/v1", tags=["charging"])

@router.post("/book-charging-station")
async def book_charging_station(data: dict, db: AsyncSession = Depends(database.get_db)):
    return {
        "charging_station": "CS-001-A",
        "msg": "Please be on time"
    }

@router.get("/get-available-charging-slots")
async def get_charging_slots(hub_id: str, charge_type: str, db: AsyncSession = Depends(database.get_db)):
    return {"used_slots": []}

@router.get("/charging-analytics")
async def charging_analytics(_from: str, _to: str):
    return {
        "_from": _from,
        "_to": _to,
        "total_amount": 0,
        "total_time_taken": 0,
        "total_vehicle_charging_count": 0,
        "fast_charge_count": 0,
        "slow_charge_count": 0,
        "range_added": 0,
        "energy_consumed": 0
    }

@router.get("/get-charging-estimated-prices")
async def get_estimated_prices(vehicle_imei: str, soc: float, voltage: float):
    charging_percentage = round(100 - soc, 2)
    return {
        "charging_percentage": charging_percentage,
        "slow_charging_time": 0,
        "fast_charging_time": 0,
        "slow_charging_price": 0,
        "fast_charging_price": 0
    }

@router.get("/charging-hubs")
async def get_charging_hubs(db: AsyncSession = Depends(database.get_db)):
    from sqlalchemy.orm import joinedload
    from sqlalchemy import select
    from .. import models, schemas
    
    query = select(models.ChargingHub).options(joinedload(models.ChargingHub.connectors))
    result = await db.execute(query)
    hubs = result.unique().scalars().all()
    
    response = []
    for hub in hubs:
        # Map flat DB address fields to nested schema
        address = schemas.ChargingAddress(
            area=hub.address_area,
            city=hub.address_city,
            country=hub.address_country,
            pin=hub.address_pin,
            premise=hub.address_premise,
            state=hub.address_state,
            street=hub.address_street
        )
        
        # Map location
        location = schemas.ChargingHubLocation(
            latitude=str(hub.lat),
            longitude=str(hub.lng)
        )
        
        # Map connectors
        connectors = [schemas.ChargingConnector.model_validate(c) for c in hub.connectors]
        
        hub_resp = schemas.ChargingHubResponse(
            hub_id=hub.hub_id,
            hub_name=hub.hub_name,
            provider=hub.provider,
            total_slots=hub.total_slots,
            last_updated_at=hub.last_updated_at,
            can_book=hub.can_book,
            address=address,
            location=location,
            connectors=connectors
        )
        response.append(hub_resp)
        
    return {"charging_hubs": response}

@router.get("/charging-pass")
async def fetch_charging_pass(user_id: str = None, db: AsyncSession = Depends(database.get_db)):
    return {"charging_passes": []}

@router.post("/charging-pass/buy")
async def buy_charging_pass(data: dict, db: AsyncSession = Depends(database.get_db)):
    return {"status": "success", "message": "Charging pass purchased successfully"}
