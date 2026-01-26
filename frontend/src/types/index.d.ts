export interface Trip {
	cost: number;
	distance: SciValue;
	electricity_tariff_per_unit: number;
	end: TripInfo;
	energy_consumed: SciValue;
	imei: string;
	last_moved_at: Date;
	start: TripInfo;
	trip_ended: boolean;
	trip_id: string;
	wh_per_km: number;
	wp_url: null;
}

export interface SciValue {
	unit: string;
	value: number;
}

export interface TripInfo {
	location: Location;
	odo: number;
	soc: number;
	time: Date | string;
}

export interface Location {
	latitude: string;
	longitude: string;
}

export interface TripAnalyticsList {
	[date: string]: {
		data: Trip[],
		toggleInfo: boolean
	}
}

declare module '*.png';
