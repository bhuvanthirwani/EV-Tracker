from sqlalchemy import Column, String, Float, DateTime, Boolean, ForeignKey, Integer, Text
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String)
    password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    profile_picture = Column(String)
    company_name = Column(String)
    language_preference = Column(String, default="en")
    phone = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicles = relationship("UserVehicle", back_populates="user")

class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String, primary_key=True)
    registration_number = Column(String, unique=True, index=True)
    chassis_number = Column(String)
    vin = Column(String)
    vehicle_category = Column(String)
    vehicle_state = Column(String, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)

    telemetry_links = relationship("VehicleTelemetry", back_populates="vehicle")
    users = relationship("UserVehicle", back_populates="vehicle")
    realtime_data = relationship("RealtimeVehicleData", back_populates="vehicle", uselist=False)

class Telematics(Base):
    __tablename__ = "telematics"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    imei = Column(String, unique=True, index=True, nullable=False)
    mac = Column(String)
    unique_id = Column(String, unique=True)
    model_name = Column(String)

    vehicle_links = relationship("VehicleTelemetry", back_populates="telematics")

class VehicleTelemetry(Base):
    __tablename__ = "vehicle_telemetry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    vehicle_id = Column(String, ForeignKey("vehicles.id"))
    telemetry_id = Column(String, ForeignKey("telematics.id"))
    is_active = Column(Boolean, default=True)

    vehicle = relationship("Vehicle", back_populates="telemetry_links")
    telematics = relationship("Telematics", back_populates="vehicle_links")

class UserVehicle(Base):
    __tablename__ = "user_vehicles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.user_id"))
    vehicle_id = Column(String, ForeignKey("vehicles.id"))
    owning_mode = Column(String, default="OWNED")
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="vehicles")
    vehicle = relationship("Vehicle", back_populates="users")

class RealtimeVehicleData(Base):
    __tablename__ = "realtime_vehicle_data"

    vehicle_id = Column(String, ForeignKey("vehicles.id"), primary_key=True)
    battery_soc = Column(Float)
    battery_soh = Column(Float)
    battery_voltage = Column(Float)
    odometer = Column(Float)
    distance_trip = Column(Float)
    speed = Column(Float)
    lat = Column(Float)
    lng = Column(Float)
    location_heading = Column(Float)
    lua_location = Column(String)
    lua_vehicle = Column(String)
    prediction_range_current = Column(Float)
    prediction_range_economy = Column(Float)
    prediction_range_formula = Column(Float)
    prediction_range_sports = Column(Float)
    status_battery = Column(Integer)
    status_route = Column(Integer)
    status_vehicle_mode = Column(Integer)
    temperature_ambient = Column(Float)
    temperature_battery = Column(Float)
    temperature_controller = Column(Float)
    temperature_motor = Column(Float)
    vehicle_range = Column(Float)
    vehicle_ttfc = Column(String)
    stark_version = Column(String)
    vehicle_immob_state = Column(Integer)
    timestamp = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="realtime_data")

class TelemetryLog(Base):
    __tablename__ = "telemetry_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    imei = Column(String, index=True)
    payload = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
class ChargingHub(Base):
    __tablename__ = "charging_hubs"
    
    hub_id = Column(String, primary_key=True)
    hub_name = Column(String)
    provider = Column(String)
    total_slots = Column(Integer)
    last_updated_at = Column(DateTime, default=datetime.utcnow)
    can_book = Column(Boolean, default=True)
    
    # Location
    lat = Column(Float)
    lng = Column(Float)
    
    # Address (Stored as separate fields for clarity)
    address_area = Column(String)
    address_city = Column(String)
    address_country = Column(String)
    address_pin = Column(String)
    address_premise = Column(String)
    address_state = Column(String)
    address_street = Column(String)
    
    connectors = relationship("ChargingConnector", back_populates="hub")

class ChargingConnector(Base):
    __tablename__ = "charging_connectors"
    
    conn_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    hub_id = Column(String, ForeignKey("charging_hubs.hub_id"))
    format = Column(String)
    power_type = Column(String)
    max_voltage = Column(Float)
    max_amperage = Column(Float)
    max_electric_power = Column(Float)
    standard = Column(String)
    tariff_id = Column(String)
    lua = Column(String)
    
    hub = relationship("ChargingHub", back_populates="connectors")
