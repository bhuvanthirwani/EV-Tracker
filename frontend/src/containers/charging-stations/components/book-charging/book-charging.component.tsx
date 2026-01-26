import React, {
	useEffect,
	useState
} from 'react';
import Sidebar from '../../../../components/shared/sidebar/sidebar.container';
import Map from '../../../../components/shared/map/map.container';
import {
	FormControl,
	FormControlLabel,
	FormLabel,
	Icon,
	InputAdornment,
	MenuItem,
	Radio,
	RadioGroup,
	TextField
} from '@mui/material';
import AppPath from '../../../../AppPath.constants';
import './book-charging.component.css';
import {
	getRequest,
	postRequest
} from '../../../../api-service';
import { AxiosResponse } from 'axios';
import API from '../../../../API_ENDPOINTS.constant';
import EstimatePopup from './estimate-popup/estimate-popup.component';
import TimeSlotPopup from './time-slot-popup/time-slot-popup.component';
import { setSlotTime } from '../../../../utils/date.utils';
import {
	Redirect,
	useLocation
} from 'react-router-dom';
import SnackbarComponent, { SnackProps } from '../../../../components/shared/snackbar.component';
import Loader from '../../../../components/shared/loader/loader.component';
import LOADER_TYPE from '../../../../loader.constant';
import VehicleUtility from '../../../../utils/vehicle.utility';
import { MapRenderTypes } from '../../../../components/shared/map/map.utility';
import UserService from '../../../../services/user.service';
import { getVehicleDetailByIMEI } from '../../../../utils/shared.api';

const BookCharging = (props: any) => {
	const location = useLocation<any>();
	const chargingHubFromProps: string = location?.state?.chargingHub?.hub_id || '';
	const vehicleFromProps: string = VehicleUtility.readIMEI(location?.state?.vehicle) || '';

	const [chargingHub, updateChargingHub] = useState<string>(chargingHubFromProps);

	const [chargingHubList, updateChargingHubList] = useState<Array<any>>([]);

	const [vehicle, updateVehicle] = useState<string>(vehicleFromProps);
	const [vehicleList, updateVehicleList] = useState<any>();

	const [vehicleInfoForMap, setVehicleInfoForMap] = useState<any>(location?.state?.vehicle || null);
	const [chargingHubInfoForMap, setChargingHubInfoForMap] = useState<any>(location?.state?.chargingHub || null);

	const [loader, updateLoader] = useState<boolean>(false);

	/* 1. It is using useEffect hook to fetch the data from the API.
		2. It is fetching the userVehicles from the API.
		3. It is updating the vehicleList with the userVehicles.
		4. It is checking if the vehicleFromProps is present or not.
		5. If vehicleFromProps is not present then it is fetching the vehicleDetail by IMEI.
		6. It is updating the vehicle with the IMEI.
		7. It is setting the vehicleInfo */
	useEffect(() => {
		(async () => {
			const userVehicles = await UserService.getUserById();
			updateVehicleList(userVehicles);
			updateLoader(true);

			if (userVehicles && !vehicleFromProps) {
				const vehicleDetail: any = await getVehicleDetailByIMEI(userVehicles[0]?.imei);
				updateVehicle(userVehicles[0]?.imei);
				setVehicleInfoForMap({ ...userVehicles[0], ...vehicleDetail });
			} else {
				const vehicleDetail: any = await getVehicleDetailByIMEI(vehicle || vehicleFromProps);
				setVehicleInfoForMap({ ...userVehicles.find((vehicle: any) => vehicle.imei == vehicleFromProps), ...vehicleDetail });
			}
			updateLoader(false);
		})();
	}, []);

	/* 1. It is calling the getVehicleList() function and subscribing to it.
		2. It is calling the getChargingHubList() function.
		3. It is returning a function that unsubscribes from the getVehicleList() function. */
	useEffect(() => {
		updateLoader(true);
		getChargingHubList();
	}, []);


	/**
	 * A function that is called when the user selects a vehicle from the dropdown.
	 * @param {any} event - any - The event object that is passed to the function.
	 */
	const handleVehicleChange = async (event: any) => {
		updateLoader(true);
		updateVehicle((event.target.value || vehicle) as string);

		const vehicleDetail: any = await getVehicleDetailByIMEI(event.target.value);

		setVehicleInfoForMap({ ...vehicleList.find((userVehicle: any) => userVehicle.imei === event.target.value), ...vehicleDetail });
		updateLoader(false);
	}

	/**
	 * It fetches the list of charging hubs from the API and updates the state with the list of charging hubs
	 */
	const getChargingHubList = () => getRequest(API.CHARGING_HUBS, {}).then((res: AxiosResponse) => {
		const chargingHubs = res?.data?.charging_hubs?.length && res.data?.charging_hubs;

		if (chargingHubs && !chargingHubFromProps) {
			updateChargingHub(chargingHubs[0]?.hub_id);
			setChargingHubInfoForMap(chargingHubs[0]);
		} else {
			setChargingHubInfoForMap(chargingHubs?.filter((chargingHub: any) => [chargingHub, chargingHubFromProps].includes(chargingHub?.hub_id))[0]);
		}
		updateChargingHubList(chargingHubs);
		updateLoader(false);
	});

	/**
	 * It updates the chargingHub state variable with the value of the event.target.value.
	 * @param {any} event - any - The event that is triggered when the user changes the value of the dropdown.
	 */
	const handleChargingHubChange = (event: any) => {
		updateChargingHub((event.target.value || chargingHub) as string);
		setChargingHubInfoForMap(chargingHubList.filter((chargingHub: any) => [chargingHub, event.target.value].includes(chargingHub?.hub_id))[0]);
	}

	const currentTime = new Date().toTimeString().slice(0, 5);
	const dateToDisplay = new Date().toISOString().slice(0, 10);


	const [estimatedRates, updateEstimatedRates] = useState(null);
	/**
	 * It takes a vehicleId as a parameter, finds the vehicle in the vehicleList, and then makes a GET request to the
	 * API
	 * @param {string} vehicleId - The IMEI of the vehicle.
	 * @returns a promise.
	 */
	const getEstimateRate = async (vehicleId: string): Promise<any> => {
		const vehicle = vehicleInfoForMap;

		return await getRequest(
			API.GET_ESTIMATE_RATES,
			{
				vehicle_imei: VehicleUtility.readIMEI(vehicle),
				soc: vehicle?.battery?.soc,
				voltage: vehicle?.battery?.voltage
			})
			.then((resp: AxiosResponse) => {
				showEstimatePopup(resp.data);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	const handleSnackBarClose = () => {
		setBookingSnackbar({ ...bookingSnackProps });
	}

	const bookingSnackProps: SnackProps = {
		open: false,
		message: '',
		onClose: handleSnackBarClose,
		severity: 'success'
	}

	const [redirect, updateRedirect] = useState({ navigate: false, data: {} });
	const [bookingSnackbar, setBookingSnackbar] = useState<SnackProps>(bookingSnackProps);

	/**
	 * It takes in the user's input and sends a POST request to the backend to book a charging slot
	 * @returns a promise.
	 */
	const bookChargingSlot = async () => {
		if (chargingHub || vehicle || slot[0] || slot[1] || chargeType) {
			const bookingParams = {
				vehicle_imei: vehicle,
				hub_id: chargingHub,
				slot_start_dt: slot[0],
				slot_end_dt: slot[1],
				charge_type: chargeType
			};
			return await postRequest(
				API.BOOK_CHARGING_STATION,
				{
					...bookingParams
				})
				.then((resp: AxiosResponse) => {
					if (resp?.data?.charging_station) {
						updateRedirect({
							navigate: true,
							data: {
								response: resp?.data?.charging_station,
								info: bookingParams,
								hub: chargingHubInfoForMap,
								vehicle: vehicleInfoForMap
							}
						});
					} else {
						setBookingSnackbar({
							...bookingSnackbar,
							open: true,
							message: resp?.data?.msg,
							severity: 'error'
						})
					}
				})
				.catch((error) => {
					console.error(error);
				});
		}
	};

	const [timeSlotPopupOpen, setTimeSlotPopupOpen] = useState(false);
	const [usedSlots, updateUsedSlots] = useState([]);

	const [slot, updateSlot] = useState<Array<string>>([]);

	/**
	 * It takes a value, if it's not undefined, it updates the slot with the value, and then closes the popup
	 * @param {any} [value] - The value of the selected time slot.
	 */
	const handleTimeSlotPopupClose = (value?: any) => {
		if (value) updateSlot([setSlotTime(value[0]), setSlotTime(value[1])]);
		setTimeSlotPopupOpen(false);
	}

	/**
	 * It takes in a data object, updates the usedSlots state, and then opens the time slot popup
	 * @param {any} [data] - The data object that is passed to the onClick function of the calendar.
	 */
	const showSlotAvailability = (data?: any) => {
		updateUsedSlots(data);
		setTimeSlotPopupOpen(true);
	};

	const [chargeType, updateChargeType] = useState<any>('AC_001');

	const handleChargeTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => updateChargeType((event?.target as HTMLInputElement)?.value);

	/**
	 * It makes a request to the API, and if the request is successful, it calls the showSlotAvailability function
	 * @param {string} hubId - The ID of the hub you want to get the available slots for.
	 * @returns An array of objects.
	 */
	const getAvailableSlots = async (hubId: string) => {
		return await getRequest(
			API.AVAILABLE_SLOTS,
			{
				hub_id: hubId,
				charge_type: chargeType,
			})
			.then((resp: AxiosResponse) => {
				showSlotAvailability(resp.data);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	const [open, setOpen] = React.useState(false);

	const handleClose = (value?: any) => {
		setOpen(false);
	}

	const showEstimatePopup = (data: any) => {
		updateEstimatedRates(data);
		setOpen(true);
	}

	/* The above code is a React component written in TypeScript. It is a functional component. It is a component that is used
	to book a charging slot for a vehicle. */
	const renderContent = () => {
		return (
			<>
				<div className="card-background" />
				<div className="card-container">
					<div className="card">
						{
							vehicleList && vehicleList.length && (
								<TextField
									select
									label={'Vehicle'}
									onChange={handleVehicleChange}
									InputProps={{
										startAdornment: <InputAdornment
											position="start"><Icon className='material-symbols-outlined'>navigation</Icon></InputAdornment>
									}}
									SelectProps={{
										defaultValue: vehicle,
										value: vehicle
									}}
								>
									{
										vehicleList.map((vehicle: any, key: number) => (
											<MenuItem
												key={key}
												value={VehicleUtility.readIMEI(vehicle)}
											>
												{VehicleUtility.readRegistrationNumber(vehicle)}
											</MenuItem>
										))
									}
								</TextField>
							)
						}

						{
							chargeType && (
								<FormControl component="fieldset" className={'radio-group'}>
									<FormLabel component="legend">Charging Type</FormLabel>
									<RadioGroup
										row
										onChange={handleChargeTypeChange}
										aria-label="charging_type"
										name="charge_type_radio_group"
										value={chargeType}
									>
										<FormControlLabel value="AC_001" control={<Radio />} label="AC" />
										<FormControlLabel value="DC_001" control={<Radio />} label="DC Fast" />
										<FormControlLabel value="DC_001_FAST" control={<Radio />} label="Lightning Fast" />
									</RadioGroup>
								</FormControl>
							)
						}

						{
							chargingHubList && chargingHubList.length && (
								<TextField
									select
									label={'Charging Hub'}
									onChange={handleChargingHubChange}
									InputProps={{
										startAdornment: <InputAdornment
											position="start"><Icon className='material-symbols-outlined'>ev_station</Icon></InputAdornment>
									}}
									SelectProps={{
										defaultValue: chargingHub,
										value: chargingHub
									}}
								>
									{
										chargingHubList.map((option: any, key: number) => (
											<MenuItem key={key} value={option?.hub_id}>
												{option?.hub_name}
											</MenuItem>
										))
									}
								</TextField>
							)
						}


						<div className="time-slot-container">
							<TextField
								label={'Date'}
								disabled
								type="date"
								value={dateToDisplay}
							/>

							<TextField
								label={'Time'}
								disabled
								type="time"
								value={currentTime}
								onClick={() => getAvailableSlots(chargingHub)}
							/>
						</div>
					</div>
				</div>

				<div className="button-container">
					<button
						type="button"
						className="btn btn-estimate"
						onClick={() => getEstimateRate(vehicle)}
					>
						<span className="currency-icon">₹</span> Get Estimate Rates
					</button>

					<button
						disabled={!(chargeType && slot[0] && slot[1] && vehicle && chargingHub)}
						type="button"
						onClick={bookChargingSlot}
					>
						Book Charging Slot
					</button>
				</div>

				{
					open && <EstimatePopup
						data={estimatedRates}
						open={open}
						onClose={handleClose}
						styling={'estimated-rate-dialog-position'}
					/>
				}

				{
					timeSlotPopupOpen && <TimeSlotPopup
						open={timeSlotPopupOpen}
						onClose={handleTimeSlotPopupClose}
						data={usedSlots}
						styling={'time-slot-dialog-position'}
					/>
				}
			</>
		);
	}

	/**
	 * If the chargingHub, vehicle, vehicleInfoForMap, and chargingHubInfoForMap are all defined, then render a map
	 * with the directions from the vehicle to the charging hub. Otherwise, render a map with no markers
	 * @returns A map component with the following props:
	 * 	- markerDisplay: The title of the vehicle marker
	 * 	- chargingHubName: The name of the charging hub
	 * 	- start: The location of the vehicle
	 * 	- end: The location of the charging hub
	 * 	- type: The type of map to render
	 * 	- renderMap: Whether or not to render the map
	 */
	const renderMap = () => {
		return (
			(chargingHub && vehicle && vehicleInfoForMap && chargingHubInfoForMap)
				? <Map
					{...{
						markerDisplay: VehicleUtility.readVehicleMarkerTitle(vehicleInfoForMap),
						chargingHubName: chargingHubInfoForMap?.hub_name,
						start: vehicleInfoForMap?.location,
						end: chargingHubInfoForMap?.location,
						type: MapRenderTypes.DIRECTIONS,
						renderMap: true
					}}
				/>
				: <Map {...{ markers: [], renderMap: true }} />
		);
	}

	return (
		<>
			{
				loader || !vehicle || !chargingHub || !chargingHubInfoForMap || !vehicleInfoForMap
					? (<Loader type={LOADER_TYPE.FULL_PAGE} />)
					: (
						<div className={'ev-sidebar-map-container'}>
							{
								redirect?.navigate && <Redirect to={{ pathname: `${AppPath.CHARGING_STATION}/book/confirmation`, state: { data: redirect.data } }} />
							}
							<Sidebar
								backlink={AppPath.CHARGING_STATION}
								title={{ show: true, text: 'Charging Stations' }}
								content={renderContent()}
							/>
							{
								(chargingHub && vehicle && vehicleInfoForMap && chargingHubInfoForMap) && renderMap()
							}
							{
								bookingSnackbar?.open && <SnackbarComponent {...bookingSnackbar} />
							}
						</div>
					)
			}
		</>
	);
}

export default BookCharging;
