export default interface fciiVEHICLE {
	battery: BATTERY;
	distance: DISTANCE;
	imei: string;
	location: LOCATION;
	vehicle_meta: META;
	temperature: TEMPERATURE;
	status: VEHICLE_STATUS;
	speed: number;
	lua: LUA;
	v_reg_num?: string;
	chassis_number?: string;
}


export interface BATTERY {
	soc: number;
	ttfc: number;
	temperature: number;
	soh?: number;
}

export interface DISTANCE {
	total: number;
	live: number;
	odo: number;
	range: number;
	today: number;
}

export interface LOCATION {
	coordinate: {
		latitude: number;
		longitude: number;
	},
	heading: number;
	address?: string;
}

export interface META {
	category: string;
	chassis_number: string;
	firmware: string;
	registration_number: string;
	state: string;
	t_mac: string;
	vin: string;
}

export interface TEMPERATURE {
	battery: number;
	controller: number;
	motor: number;
}

export interface VEHICLE_STATUS {
	battery: string;
	location: number;
	mob_status: string | number | null;
	route: string;
	sleep_mode: number;
	telemetry: boolean;
	vehicle_mode: string;
}

export interface LUA {
	vehicle: string;
	location: string;
}

export interface USER_VEHICLES {
	v_reg_num: string;
}
