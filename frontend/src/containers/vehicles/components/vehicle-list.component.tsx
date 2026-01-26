import React, {
	useEffect,
	useState
} from 'react';

// import { AxiosResponse } from 'axios';
import { getRequest } from '../../../api-service';
import API from '../../../API_ENDPOINTS.constant';
import CardLoader from '../../../components/shared/loader/card.loader';
import LeafletMap from '../../../components/shared/map/leaflet-map.container';
import {
	defaultBoundingBox,
	MapRenderTypes,
	MarkerType
} from '../../../components/shared/map/map.utility';
import Sidebar from '../../../components/shared/sidebar/sidebar.container';
import { getConfig } from '../../../firebase.service';
import VehicleUtility from '../../../utils/vehicle.utility';
import VehicleCard from './vehicle-cards/vehicle-card.component';

import VEHICLE from '../vehicle.interface';


const vehicleTypes = [
	{
		value: 'none',
		label: 'All'
	},
	{
		value: '3W',
		label: '3W',
	},
	{
		value: '4W',
		label: '4W',
	}
];

interface filterProps {
	search: string,
	vehicleType: string,
	vehicleStatus: Array<string>
}

let defaultFilters: filterProps = { search: '', vehicleType: vehicleTypes[0]?.value, vehicleStatus: [] }
const BatteryStatusMap = getConfig('battery_status');


const VehicleListComponent = () => {
	const [vehicles, updateVehicles] = useState<any>([]);

	const [loader, setLoader] = useState<boolean>(true);

	const [boundingBox, setBoundingBox] = useState<L.LatLngBounds | string>(defaultBoundingBox);
	const [statusFilterData, setStatusFilterData] = useState<any>(null);
	const [filters, setFilters] = useState<filterProps>(defaultFilters);
	const [showFilters, setShowFilters] = useState<any>({ search: true, vehicleType: true, vehicleStatus: true });

	useEffect(() => {
		getVehicleUpdates();
		const interval = setInterval(() => {
			getVehicleUpdates();
		}, 10 * 1000);

		return () => clearInterval(interval);
	}, [boundingBox]);

	const getVehicleUpdates = () => getRequest(API.VEHICLES_UPDATE, {
		'bb': boundingBox
	}).then((response: any) => {
		const respVehicles = Object.entries({ ...response?.data?.vehicle_data, ...response?.data?.errored_vehicle })
			.map(([key, value]: [string, any]) => ({ ...value, ...{ imei: key } }));
		updateVehicles(respVehicles);
	}).finally(() => setLoader(false));

	const getVehiclesByFilterStatus = (filteredVehiclesArray: Array<VEHICLE>) => {
		if (filters.vehicleStatus.includes('RUNNING') && filters.vehicleStatus.includes('LOW_BATTERY')) {
			return filteredVehiclesArray.filter((vehicle: any) => (vehicle.speed > 0 && vehicle?.status?.telemetry) && BatteryStatusMap[vehicle?.status?.battery] === 'Low Battery');
		} else if (filters.vehicleStatus.includes('RUNNING')) {
			return filteredVehiclesArray.filter((vehicle: any) => vehicle.speed > 0 && vehicle?.status?.telemetry);
		} else if (filters.vehicleStatus.includes('ACTIVE')) {
			return filteredVehiclesArray.filter((vehicle: any) => vehicle?.status?.telemetry);
		} else if (filters.vehicleStatus.includes('CHARGING')) {
			return filteredVehiclesArray.filter((vehicle: any) => BatteryStatusMap[vehicle?.status?.battery] === 'In Charging');
		} else if (filters.vehicleStatus.includes('LOW_BATTERY')) {
			return filteredVehiclesArray.filter((vehicle: any) => BatteryStatusMap[vehicle?.status?.battery] === 'Low Battery');
		} else if (filters.vehicleStatus.includes('NR')) {
			return filteredVehiclesArray.filter((vehicle: any) => Boolean(vehicle?.status?.telemetry) === false);
		} else if (filters.vehicleStatus.includes('Loc')) {
			return filteredVehiclesArray.filter((vehicle: any) => Boolean(vehicle?.location?.coordinate?.latitude) === false);
		} else {
			return filteredVehiclesArray;
		}
	}

	useEffect(() => {
		if (!vehicles.length) {
			setShowFilters({ ...showFilters, vehicleStatus: false });
		} else if (!showFilters.vehicleStatus) {
			setShowFilters({ ...showFilters, vehicleStatus: true });
		}

		defaultFilters = filters
		let filteredVehiclesArray = [...vehicles];

		if (filters.search && filters.search.length) {
			filteredVehiclesArray = filteredVehiclesArray.filter((vehicle: any) => VehicleUtility.readRegistrationNumber(vehicle)?.toLowerCase().includes(filters.search.toLowerCase()));
		}

		if (filters.vehicleType != vehicleTypes[0]?.value) {
			filteredVehiclesArray = filteredVehiclesArray.filter((vehicle: any) => vehicle?.vehicle_meta?.category === filters.vehicleType);
		}

		const statusData = { RUNNING: 0, ACTIVE: 0, CHARGING: 0, LOW_BATTERY: 0, NR: 0, Loc: 0 };
		filteredVehiclesArray.map((vehicle: any) => {
			if (vehicle?.status) {
				if (vehicle?.speed > 0 && vehicle.status?.telemetry) {
					statusData.RUNNING += 1;
				}
				if (vehicle.status?.telemetry) {
					statusData.ACTIVE += 1;
				} else {
					statusData.NR += 1;
				}
				if (BatteryStatusMap[vehicle.status?.battery] === 'In Charging') {
					statusData.CHARGING += 1;
				}
				if (BatteryStatusMap[vehicle.status?.battery] === 'Low Battery') {
					statusData.LOW_BATTERY += 1;
				}
				if (!vehicle?.location?.coordinate?.latitude) {
					statusData.Loc += 1;
				}
			}
		});
		setStatusFilterData(statusData);

		filteredVehiclesArray = getVehiclesByFilterStatus(filteredVehiclesArray);

		updateFilteredVehicles(filteredVehiclesArray);

	}, [vehicles, filters]);

	const [filteredVehicles, updateFilteredVehicles] = useState(vehicles);

	const filterVehicleByType = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setFilters({ ...filters, vehicleType: event?.target?.value, vehicleStatus: [] })
	};

	const searchVehicle = (event: any) => {
		setFilters({ ...filters, search: event.target.value });
	}

	const filterVehicleByStatus = (filterBy: string) => {
		if (filters.vehicleStatus.includes(filterBy)) {
			const selectedStatus = filters.vehicleStatus;
			selectedStatus.splice(selectedStatus.indexOf(filterBy), 1);
			setFilters({ ...filters, vehicleStatus: selectedStatus });
		} else {
			if ((filters.vehicleStatus.includes('RUNNING') && filterBy === 'LOW_BATTERY') || (filters.vehicleStatus.includes('LOW_BATTERY') && filterBy === 'RUNNING')) {
				setFilters({ ...filters, vehicleStatus: [...filters.vehicleStatus, filterBy] });
			} else {
				setFilters({ ...filters, vehicleStatus: [filterBy] });
			}
		}
	};

	const vehiclesData = (vehiclesParam: any) => vehiclesParam.map((vehicle: any, key: number) => <VehicleCard vehicle={vehicle} key={vehicle?.imei} />);

	return (
		<div className={'ev-sidebar-map-container'}>
			{
				<Sidebar
					filters={
						{
							search: {
								show: showFilters?.search,
								label: 'Search Vehicle',
								value: filters?.search,
								placeholder: 'ex. 8XYZ123',
								changeAction: searchVehicle
							},
							dropdown: {
								show: showFilters?.vehicleType,
								label: 'Type',
								options: vehicleTypes,
								defaultValue: filters?.vehicleType,
								changeAction: filterVehicleByType
							},
							statusFilter: {
								show: showFilters?.vehicleStatus,
								statusData: statusFilterData,
								selectedFilter: filters?.vehicleStatus,
								changeAction: filterVehicleByStatus
							}
						}
					}
					contentPadding={'0'}
					content={
						loader ? (<CardLoader />) : filteredVehicles?.length ? vehiclesData(filteredVehicles)
							: (
								<div className={'flex flex-center flex-justify-center'}>
									No Vehicle found
								</div>
							)
					}
				/>
			}
			<LeafletMap
				markers={filteredVehicles?.length ? filteredVehicles : []}
				type={MapRenderTypes.MARKERS}
				renderMap={true}
				locationKey={['location', 'coordinate']}
				markerType={MarkerType.VEHICLES}
				updateBoundingBox={setBoundingBox}
			/>
		</div>
	);
}

export default VehicleListComponent;
