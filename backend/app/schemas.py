from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from typing import Optional, List

class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    profile_picture: Optional[str] = None
    company_name: Optional[str] = None
    phone: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    user_id: str
    is_active: bool
    is_verified: bool
    token: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class VehicleBase(BaseModel):
    id: str
    registration_number: str
    chassis_number: Optional[str] = None
    vin: Optional[str] = None
    vehicle_category: Optional[str] = None
    vehicle_state: str = "ACTIVE"

    model_config = ConfigDict(from_attributes=True)

class RealtimeDataResponse(BaseModel):
    vehicle_id: str
    battery_soc: Optional[float] = None
    battery_soh: Optional[float] = None
    battery_voltage: Optional[float] = None
    odometer: Optional[float] = None
    distance_trip: Optional[float] = None
    speed: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    location_heading: Optional[float] = None
    lua_location: Optional[str] = None
    lua_vehicle: Optional[str] = None
    prediction_range_current: Optional[float] = None
    prediction_range_economy: Optional[float] = None
    prediction_range_formula: Optional[float] = None
    prediction_range_sports: Optional[float] = None
    status_battery: Optional[int] = None
    status_route: Optional[int] = None
    status_vehicle_mode: Optional[int] = None
    temperature_ambient: Optional[float] = None
    temperature_battery: Optional[float] = None
    temperature_controller: Optional[float] = None
    temperature_motor: Optional[float] = None
    vehicle_range: Optional[float] = None
    vehicle_ttfc: Optional[str] = None
    stark_version: Optional[str] = None
    vehicle_immob_state: Optional[int] = None
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class TelemetryIngest(BaseModel):
    imei: str
    battery_soc: Optional[float] = None
    battery_soh: Optional[float] = None
    battery_voltage: Optional[float] = None
    odometer: Optional[float] = None
    distance_trip: Optional[float] = None
    speed: Optional[float] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    location_heading: Optional[float] = None
    lua_location: Optional[str] = None
    lua_vehicle: Optional[str] = None
    prediction_range_current: Optional[float] = None
    prediction_range_economy: Optional[float] = None
    prediction_range_formula: Optional[float] = None
    prediction_range_sports: Optional[float] = None
    status_battery: Optional[int] = None
    status_route: Optional[int] = None
    status_vehicle_mode: Optional[int] = None
    temperature_ambient: Optional[float] = None
    temperature_battery: Optional[float] = None
    temperature_controller: Optional[float] = None
    temperature_motor: Optional[float] = None
    vehicle_range: Optional[float] = None
    vehicle_ttfc: Optional[str] = None
    stark_version: Optional[str] = None
    vehicle_immob_state: Optional[int] = None

class ChargingAddress(BaseModel):
    area: str
    city: str
    country: str
    pin: str
    premise: str
    state: str
    street: str

class ChargingConnector(BaseModel):
    conn_id: str
    format: str
    max_amperage: float
    max_electric_power: float
    max_voltage: float
    power_type: str
    standard: str
    tariff_id: str
    lua: str = "" # Added based on interface

    model_config = ConfigDict(from_attributes=True)

class ChargingHubLocation(BaseModel):
    latitude: str
    longitude: str

class ChargingHubResponse(BaseModel):
    hub_id: str
    hub_name: str
    provider: str
    total_slots: int
    last_updated_at: datetime
    can_book: bool
    address: ChargingAddress
    connectors: List[ChargingConnector]
    location: ChargingHubLocation
    
    model_config = ConfigDict(from_attributes=True)
