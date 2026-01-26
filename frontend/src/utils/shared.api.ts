// import { ENABLE_GEOCODING } from '../utils';
import {getRequest} from '../api-service';
import API from '../API_ENDPOINTS.constant';

export const getFormattedAddress = async (coordinate: any) => {
	let counter = 0;
	let response: any;

	// if(!ENABLE_GEOCODING) {
	// 	return `Geocoding disabled for env - ${process.env.NODE_ENV}`;
	// }

	if (coordinate && coordinate.latitude && coordinate.longitude) {
		while (!response?.data?.resp && counter < 3) {
			try {
				counter++;
				response = await getRequest(
					API.GET_ALL_LOCATION,
					{
						lat: coordinate?.latitude,
						lng: coordinate?.longitude
					});

				if (!response.data?.resp) {
					await sleep();
					throw new Error('retry');
				}
				return response?.data?.resp?.[0]?.formatted_address || response?.data?.resp?.[1]?.formatted_address;
			}
			catch (error) { }
		}
	} else {
		return undefined;
	}
}

const sleep = () => {
	return new Promise(resolve => {
		setTimeout(() => resolve('try'), 500)
	});
}


/**
 * It takes an IMEI number as a parameter and returns the vehicle data from the API
 * @param {string} imei - The IMEI of the vehicle you want to get the details of.
 * @returns The vehicle data
 */
export const getVehicleDetailByIMEI = async (imei: string) => {
	if (imei) {
		const vehicle: any = await getRequest(API.V3_GET_VEHICLE_UPDATE, {imei});
		return vehicle?.data?.vehicle_data;
	}
	return null;
}
