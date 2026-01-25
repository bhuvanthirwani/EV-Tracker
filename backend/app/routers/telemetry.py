from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from .. import models, schemas, database

router = APIRouter(prefix="/api/v1/telemetry", tags=["telemetry"])

@router.post("", status_code=201)
async def ingest_telemetry(data: schemas.TelemetryIngest, db: AsyncSession = Depends(database.get_db)):
    # 1. Log Raw Telemetry
    log = models.TelemetryLog(imei=data.imei, payload=data.model_dump_json())
    db.add(log)
    
    # 2. Update Realtime Data
    query = select(models.Vehicle.id).join(models.VehicleTelemetry).join(models.Telematics).where(models.Telematics.imei == data.imei)
    result = await db.execute(query)
    vehicle_id = result.scalar_one_or_none()
    
    if vehicle_id:
        update_data = {k: v for k, v in data.model_dump().items() if v is not None and k != 'imei'}
        stmt = update(models.RealtimeVehicleData).where(models.RealtimeVehicleData.vehicle_id == vehicle_id).values(**update_data)
        await db.execute(stmt)
    
    await db.commit()
    return {"status": "ingested"}

@router.get("/latest/{vehicle_id}")
async def get_latest_telemetry(vehicle_id: str, db: AsyncSession = Depends(database.get_db)):
    result = await db.execute(
        select(models.RealtimeVehicleData).where(models.RealtimeVehicleData.vehicle_id == vehicle_id)
    )
    data = result.scalar_one_or_none()
    if not data:
        raise HTTPException(status_code=404, detail="No telemetry data found for this vehicle")
    return schemas.RealtimeDataResponse.model_validate(data)
