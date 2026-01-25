from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc
from typing import List, Dict
from datetime import datetime, timedelta
from .. import models, schemas, constants

class VehicleService:
    @staticmethod
    async def get_user_vehicles(db: AsyncSession, user_id: str):
        query = select(models.Vehicle).join(models.UserVehicle).where(models.UserVehicle.user_id == user_id)
        result = await db.execute(query)
        vehicles = result.scalars().all()
        return vehicles

    @staticmethod
    async def get_fleet_analytics(db: AsyncSession, user_id: str, last_n_days: int):
        # In a production system, this would be a complex series of aggregations or a query to a pre-computed analytics table.
        # For this replication, we will compute some dummy but structure-compliant data based on the RealtimeVehicleData.
        
        resp = constants.RESPONSE_CONFIG_HOURLY if last_n_days == 1 else constants.RESPONSE_CONFIG_HOURLY
        
        # In reality, we'd fetch actual time-series from RideAnalytics or TelemetryLogs.
        # Here we mock the data array to match the order and structure the frontend expects.
        
        # Example logic to populate charts:
        for chart in resp["charts"]:
            if chart["title"] == "Daily Active Vehicles":
                chart["value"] = 1
                chart["data"] = [{"12:00": 1}, {"14:00": 1}]
            elif chart["title"] == "Current Running Vehicles":
                chart["value"] = 1
                chart["data"] = [{"12:00": 1}]
            elif chart["title"] == "Total KMS Travelled":
                chart["value"] = 150.5
                chart["data"] = [{"10:00": 20}, {"12:00": 50}, {"14:00": 80.5}]
            # ... and so on for other charts
            
        return resp

    @staticmethod
    async def get_vehicle_static_details(db: AsyncSession, vehicle_id: str):
        query = select(models.Vehicle).where(models.Vehicle.id == vehicle_id)
        result = await db.execute(query)
        vehicle = result.scalar_one_or_none()
        
        if not vehicle:
            return None
            
        # Match legacy return structure
        return {
            "registration_number": vehicle.registration_number,
            "chassis_number": vehicle.chassis_number,
            "assembly_date": vehicle.created_at.isoformat(),
            "image_url": None,
            "user_details": {"rented_by": None, "driver_details": None},
            "emi": {"amount": None, "date": None, "tenure": None},
            "owner": "Bhuvan Thirwani",
            "location": {"latitude": 12.9716, "longitude": 77.5946}, # Should pull from realtime_data if available
            "firmware": "v0.8.1",
            "imei": "123456789012345"
        }
