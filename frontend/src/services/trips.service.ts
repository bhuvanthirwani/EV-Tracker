import { Trip, TripAnalyticsList } from '../types';
import { getRequest } from '../api-service';
import API from '../API_ENDPOINTS.constant';
import { formatDateWithYear } from '../utils/date.utils';

const TripsService = {
	getTripList: async (vehicle_id: string, fromDate: Date, paramToDate: Date, queryPageNumber: number, reg_num: string, limit = 100) => {
		if (reg_num) {
			return await getRequest(
				API.GET_RIDES,
				{
					vehicle_ids: `[${vehicle_id}]`,
					from: fromDate,
					to: paramToDate,
					page_no: queryPageNumber,
					limit: limit,
					reg_num
				}
			);
		}
	},
	getVehicleUpdateBB: async (bounding_box: any) => {
		return await getRequest(
			API.VEHICLES_UPDATE,
			{
				'bb': bounding_box
			}
		);
	},
	getLiveTrip: async (vehicle_id: string, fromDate: Date, paramToDate: Date, queryPageNumber: number, limit = 20) => {
		return await getRequest(
			API.GET_LIVE_TRIPS,
			{
				vehicle_ids: `[${vehicle_id}]`,
				from: fromDate,
				to: paramToDate,
				page_no: queryPageNumber,
				limit: limit
			}
		);
	},
	mergeTripsList: (fromDate: Date, toDate: Date, initial: TripAnalyticsList, update: TripAnalyticsList): TripAnalyticsList => {
		const _merge = { ...initial, ...update };
		Object.keys(initial).forEach(date_str => {
			const _date = new Date(date_str);
			if (_date < fromDate || _date >= toDate) {
				delete _merge[date_str]
			}
		})
		return _merge
	},
	sortTripsList: (trips_list: any) => {
		const keys = Object.keys(trips_list);
		keys.sort((a: string, b: string) => {
			return Date.parse(b) - Date.parse(a);
		});

		const sortedObject: any = {};

		keys.map((key: string) => {
			sortedObject[key] = trips_list[key];
		});

		return sortedObject
	},
	generateWaypointsUsingRawTrip: (trip: Trip) => {
		return [
			{
				dt: trip.start.time,
				lat: trip.start.location.latitude,
				lon: trip.start.location.longitude
			},
			{
				dt: trip.end.time,
				lat: trip.end.location.latitude,
				lon: trip.end.location.longitude
			}
		]
	},
	createDateObjectFromTripList: (trips_data: Trip[]) => {
		const ridesData: TripAnalyticsList = {};
		trips_data.forEach((trip: any) => {
			if (trip?.hasOwnProperty('trip_id')) {
				const time: any = trip?.start?.time * 1000
				const startTime = formatDateWithYear(time as string);

				if (!ridesData[startTime]) {
					ridesData[startTime] = {
						toggleInfo: false,
						data: []
					};
				}
				// make sure that duplicate trips are not being pushed while loadingMore trip.
				if (!ridesData[startTime].data.find(el => el.trip_id === trip.trip_id)) {
					ridesData[startTime].data.push(trip);
				}
			}
		});
		return ridesData;
	}
}

export default TripsService;
