import { AxiosResponse } from 'axios';
import React, {
	useContext,
	useEffect,
	useState
} from 'react';

import { useLocation } from 'react-router-dom';

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { SnackProps } from '../../components/shared/snackbar.component';
import API from '../../API_ENDPOINTS.constant';
import { SnackbarContext } from '../../App';
import { getRequest } from '../../api-service';
import CardLoader from '../../components/shared/loader/card.loader';
import LeafletMap from '../../components/shared/map/leaflet-map.container';
import { MapRenderTypes, MarkerType, calculateDistance, getDefaultBoundingBox } from '../../components/shared/map/map.utility';
import Sidebar from '../../components/shared/sidebar/sidebar.container';
import UserService from '../../services/user.service';
import { getFormattedAddress } from '../../utils/shared.api';
import './charging-station.container.css';
import { CONNECTOR, FILTERKEYS, FILTERS, HUB } from './charging-station.interfaces';
import ChargingStationCard from './components/charging-station-cards/charging-station-card.component';
import { createPageTitle } from '../../utils';

let availableSlotsByHubId: object | any = {};
const formattedAddressByHubId: object | any = {};
const distanceFromLocationByHubId: object | any = {};

const filterToSet: any = {};

export const LOCATION_DENY_MESSAGE = 'Please allow location permission in browser settings to see nearby Stations distance or Refresh if already provided!';

const ChargingStationsContainer = () => {
	document.title = createPageTitle(1);
	const [chargingHubs, updateChargingHubs] = useState<Array<HUB>>([]);
	const [availableSlots, updateAvailableSlots] = useState<any>({});
	const [formattedAddress, updateFormattedAddress] = useState<any>({});
	const [loader, updateLoader] = useState<boolean>(false);

	const [boundingBox, setBoundingBox] = useState<L.LatLngBounds | string>();

	const [chargingStationsFilters, setChargingStationsFilters] = useState<Array<FILTERS>>([]);
	const [appliedFilters, updateAppliedFilters] = useState<any>(filterToSet);

	const [locationForDistance, setLocationForDistance] = useState<any>();

	const [vehicles, setVehicles] = useState<Array<any>>([]);
	const params: any = useLocation().state;
	const [vehicleForDistance, setVehicleForDistance] = useState<any>(params?.vehicle);

	const onVehicleChange = () => {
		if (params && params?.vehicle) {
			setVehicleForDistance(params?.vehicle);
		}
	}

	useEffect(() => {
		onVehicleChange();
	}, [params?.vehicle])


	useEffect(() => {
		const location = (loc: any) => setLocationForDistance(loc);

		const errorCallback = async (loc?: any) => {
			const handleSnackbarClose = () => {
				setSnackState({ ...snackProps });
			}

			const snackProps: SnackProps = {
				open: false,
				severity: 'error',
				message: '',
				autoHideDuration: 300000,
				onClose: handleSnackbarClose
			};

			const permissionState = await navigator.permissions.query({ 'name': 'geolocation' });

			if (permissionState?.state === 'denied') {
				setSnackState({
					...snackProps,
					open: true,
					message: LOCATION_DENY_MESSAGE
				});
			}
		}

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(location, errorCallback);
		}
	}, []);

	useEffect(() => {
		updateLoader(true);
		getUserVehicles();

		const bBox = getDefaultBoundingBox();
		console.log(bBox, boundingBox);

		getRequest(API.CHARGING_HUBS_V2, {})
			.then((res: AxiosResponse) => {
				const chargingHubs = res?.data?.charging_hubs?.length && res.data?.charging_hubs;

				chargingHubs?.length && chargingHubs?.forEach((hub: HUB) => {
					if (Object.hasOwn(hub, 'address')) {
						const address = typeof hub.address === typeof 'njd'
							? hub.address
							: [
								hub.address.premise,
								hub.address.street,
								hub.address.area,
								hub.address.state,
								hub.address.city,
								hub.address.pin
							].filter(Boolean).join(', ');
						formattedAddressByHubId[hub?.hub_id] = address;
						updateFormattedAddress(formattedAddressByHubId);
					} else {
						getFormattedAddress(hub?.location).then((res: any) => {
							formattedAddressByHubId[hub?.hub_id] = res;
							if (chargingHubs.length === Object.keys(formattedAddressByHubId).length) {
								updateFormattedAddress(formattedAddressByHubId);
							}
						});
					}
				});
				updateChargingHubs(chargingHubs);
			}).finally(() => updateLoader(false));
	}, []);

	useEffect(() => {
		populateChargingStationFilters(chargingHubs);
	}, [chargingHubs]);


	const getUserVehicles = async () => {
		const userVehicles = await UserService.getUserById();

		if (userVehicles?.length) {
			const vehicles = userVehicles.map((vehicle: any) => vehicle?.v_reg_num);
			setVehicles(vehicles);
		}
	}

	const populateChargingStationFilters = (chargingHubs: Array<HUB>) => {
		const filters: Array<FILTERS> = [];

		const distanceSortOptions = ['--All--', 5, 10, 20, 50, 100];

		if (chargingHubs?.length) {
			const providers = ['--All--', ...Array.from(new Set(chargingHubs.map((hub: HUB) => hub.provider)))];
			const chargingTypes = ['--All--', ...Array.from(new Set([...chargingHubs.reduce((acc, { connectors }) => (connectors.forEach(acc.add, acc), acc), new Set())].map((connector: CONNECTOR) => connector.power_type)))];

			filters.push({
				label: 'Providers',
				key: FILTERKEYS.PROVIDERS,
				type: 'dropdown',
				data: providers,
				show: true,
				optionPrefix: '',
				optionSuffix: '',
				defaultValue: providers[0],
				changeAction: (event: any) => filterHubs(event)
			});

			filters.push({
				label: 'Charging Type',
				key: FILTERKEYS.CONNECTORS,
				type: 'dropdown',
				data: chargingTypes,
				show: true,
				optionPrefix: '',
				optionSuffix: '',
				defaultValue: chargingTypes[0],
				changeAction: (event: any) => filterHubs(event)
			});

			filters.push({
				label: 'Distance',
				key: FILTERKEYS.DISTANCE,
				type: 'dropdown',
				data: distanceSortOptions,
				show: true,
				optionPrefix: 'Upto',
				optionSuffix: 'kms',
				defaultValue: distanceSortOptions[0],
				changeAction: (event: any) => filterHubs(event)
			});

			const vehicleOptions = ['Select vehicle', ...vehicles];

			filters.push({
				label: 'Vehicle Location',
				key: FILTERKEYS.VEHICLE,
				type: 'dropdown',
				data: vehicleOptions,
				show: false,
				optionPrefix: '',
				optionSuffix: '',
				defaultValue: vehicleOptions[0],
				changeAction: (event: any) => sortHubs(event)
			});

			setChargingStationsFilters(filters);
		}
	}

	const { setSnackState } = useContext(SnackbarContext);
	const [filteredHubs, updateFilteredHubs] = useState<Array<HUB>>(chargingHubs);

	useEffect(() => {
		if (locationForDistance && locationForDistance?.coords && chargingHubs?.length) {
			chargingHubs?.map((hub: HUB) => {
				distanceFromLocationByHubId[hub?.hub_id] = calculateDistance({ latitude: locationForDistance.coords.latitude, longitude: locationForDistance.coords.longitude }, { ...hub.location });
				hub['distance'] = distanceFromLocationByHubId[hub?.hub_id];
			});
			chargingHubs.sort((a: HUB | any, b: HUB | any) => parseFloat(a['distance']) - parseFloat(b['distance']));
			updateFilteredHubs(chargingHubs);
		} else {
			filterHubs();
		}
	}, [locationForDistance?.coords, vehicleForDistance, chargingHubs]);

	const sortHubs = (event: any) => {
		setLocationForDistance(vehicleForDistance)
	}

	// @ts-ignore
	const sortAndFilter = (hubs: Array<HUB>) => hubs.filter((hub: HUB | any) => {
		let flag = true;

		for (const filter in appliedFilters) {
			const filterValue: number | string = appliedFilters[filter];
			let value: string | number = typeof filterValue === 'string' ? filterValue.toLowerCase() : filterValue;

			if (typeof value === 'string' && filter === 'search') {
				value = value.replaceAll(' ', '');
			}

			if ((filter === FILTERKEYS.CONNECTORS && ((hub[filter] instanceof Array) && (hub[filter].flatMap((connector: CONNECTOR) => connector.power_type.toLowerCase()).includes(value))))) {
				continue;
			} else if (filter === FILTERKEYS.DISTANCE && (distanceFromLocationByHubId[hub.hub_id] <= value)) {
				continue;
			} else if (filter === FILTERKEYS.PROVIDERS && hub[filter] && hub[filter].toLowerCase().includes(value)) {
				continue;
			} else if ((filter === 'search' && typeof value === 'string' && value.length >= 2) && (hub?.hub_name.toLowerCase().includes(value)
				|| formattedAddress?.[hub?.hub_id]?.toLowerCase().includes(value))) {
				continue;
			}
			flag = false;
		}

		if (flag) {
			return true;
		}
	});

	const filterHubs = (event?: any) => {
		if (event) {
			const targetValue = event?.target?.value;
			const eventName: string = event.target.name.toLowerCase();

			if (typeof targetValue === 'string' && (targetValue.includes('All'))) {
				delete filterToSet[eventName];
			} else {
				if (eventName === 'search' && targetValue.replaceAll(' ', '').length >= 2) {
					filterToSet[eventName] = targetValue;
				} else if (eventName !== 'search') {
					filterToSet[eventName] = targetValue;
				} else {
					delete filterToSet[eventName];
				}
			}

			updateAppliedFilters(filterToSet);

			if (Object.keys(appliedFilters).length) {
				const filteredHubList: Array<HUB> = sortAndFilter(chargingHubs);

				updateFilteredHubs(filteredHubList);
				return;
			}
			updateFilteredHubs(chargingHubs);
			return;
		}
		updateFilteredHubs(chargingHubs);
		return;
	}

	// @ts-ignore
	const getSlotsAvailability = async (hubID: string, chargeType: string, totalSlots: number) => {
		let usedSlots = 0;
		if (hubID && chargeType) {
			await getRequest(API.AVAILABLE_SLOTS, {
				hub_id: hubID,
				charge_type: chargeType
			}).then((res: AxiosResponse) => {
				usedSlots = res.data?.used_slots?.length;

				availableSlotsByHubId[hubID] = totalSlots - usedSlots;

				availableSlotsByHubId = Object.assign(availableSlotsByHubId, availableSlotsByHubId[hubID]);

				if (Object.keys(availableSlotsByHubId).length === chargingHubs.length) {
					updateAvailableSlots(availableSlotsByHubId);
				}
				updateLoader(false);
			}).catch((error) => updateLoader(false));
			return availableSlotsByHubId;
		}
		updateLoader(false);
		return;
	};

	return (
		<>
			<div className={'ev-sidebar-map-container'}>
				<Sidebar
					filters={
						{
							search: {
								show: true,
								label: 'Search Hub',
								placeholder: 'ex. New York...',
								changeAction: filterHubs,
								eventName: 'search'
							},
							dropdown: {
								show: false,
								label: 'Distance',
								defaultValue: null,
								options: [],
							}
						}
					}
					contentPadding={'0'}
					height={'unset'}
					content={
						loader
							? <CardLoader />
							: (
								<>
									<div className='flex flex-center-gap charging-station__filters-container'>
										{
											// chargingStationsFilters?.length
											chargingStationsFilters?.map((filter: FILTERS) => {
												if (filter?.type === 'dropdown' && filter?.show) {
													return (
														<FormControl className='charging-station__filter' key={filter?.label}>
															<InputLabel id={filter?.label}>{filter?.label}</InputLabel>
															<Select
																label={filter?.label}
																defaultValue={filter?.defaultValue}
																onChange={filter?.changeAction}
																variant={'outlined'}
																name={filter.key}
															>
																{filter?.data?.map((option: any) => (
																	<MenuItem key={option} value={option}>
																		{typeof option === typeof 1 && filter.optionPrefix} {option} {typeof option === typeof 1 && filter.optionSuffix}
																	</MenuItem>
																))}
															</Select>
														</FormControl>
													);
												} else {
													return []
												}
											})
										}
									</div>

									{
										!loader && filteredHubs?.length
											? filteredHubs?.map((chargingHub: HUB, key: number) => <ChargingStationCard
												chargingHub={chargingHub}
												key={key}
												availableSlots={availableSlots?.[chargingHub?.hub_id]}
												address={formattedAddress?.[chargingHub?.hub_id]}
												provider={chargingHub?.provider}
												distance={distanceFromLocationByHubId?.[chargingHub?.hub_id]}
											/>)
											:
											(
												<div className={'flex flex-center flex-justify-center'}>
													No Charging stations found
												</div>
											)
									}
								</>
							)
					}
				/>
				{
					<LeafletMap
						markers={filteredHubs?.map((hub: HUB) => hub)}
						type={MapRenderTypes.MARKERS}
						renderMap={true}
						locationKey={['location']}
						markerType={MarkerType.CHARGERS}
						updateBoundingBox={setBoundingBox}
					/>
				}
			</div>
		</>
	);
}

export default ChargingStationsContainer;
