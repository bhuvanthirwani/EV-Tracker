export interface ADDRESS {
	area: string,
	city: string,
	country: string,
	pin: string,
	premise: string,
	state: string,
	street: string,
}

export interface CONNECTOR {
	conn_id: string,
	format: string,
	lua: string,
	max_amperage: number,
	max_electric_power: number,
	max_voltage: number,
	power_type: string,
	standard: string,
	tariff_id: string,
}

export interface HUB {
	hub_id: string,
	address: ADDRESS,
	can_book: number | boolean,
	connectors: Array<CONNECTOR>,
	hub_name: string,
	last_updated_at: string,
	location: {
		latitude: string,
		longitude: string
	},
	provider: string,
	total_slots: number,
	distance?: any
}

export interface FILTERS {
	type: 'radio' | 'dropdown',
	label: string | undefined,
	data: Array<any>,
	show: boolean,
	defaultValue: string | number,
	changeAction: any,
	optionPrefix: string,
	optionSuffix: string,
	key: string
}


export const FILTERKEYS = {
	PROVIDERS: 'provider',
	DISTANCE: 'distance',
	VEHICLE: 'vehicle',
	CONNECTORS: 'connectors'
}
