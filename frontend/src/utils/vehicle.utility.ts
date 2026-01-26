import VEHICLE from '../containers/vehicles/vehicle.interface';

const VehicleUtility = {
	readRegistrationNumber: (vehicle: VEHICLE | any): string => vehicle?.vehicle_meta?.registration_number || vehicle?.metadata?.registration_number || vehicle?.registration_number || vehicle?.v_reg_num || '',
	readIMEI: (vehicle: VEHICLE): string => vehicle?.imei || '',
	readVehicleMarkerTitle: (vehicle: VEHICLE): string => vehicle?.vehicle_meta?.registration_number?.slice(-4) || vehicle?.v_reg_num?.slice(-4) || '',
	readChassisNumber: (vehicle: VEHICLE | any): string => vehicle?.vehicle_meta?.chassis_number || vehicle?.chassis_number
}

export default VehicleUtility;
