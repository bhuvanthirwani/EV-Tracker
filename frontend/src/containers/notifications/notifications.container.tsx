import React, {
	useEffect,
	useState
} from 'react';
import { Skeleton } from '@mui/material';

import './notifications.component.css';
import Sidebar from '../../components/shared/sidebar/sidebar.container';
import Map from '../../components/shared/map/map.container';
import { getRequest } from '../../api-service';
import API from '../../API_ENDPOINTS.constant';
import Loader from '../../components/shared/loader/loader.component';
import LOADER_TYPE from '../../loader.constant';
import NotificationCard from './notification-card.component';
import VehicleUtility from '../../utils/vehicle.utility';
import { MapRenderTypes } from '../../components/shared/map/map.utility';
import UserService from '../../services/user.service';
import { createPageTitle } from '../../utils';

const vehiclesByRegNumberMap: any = {};

const NotificationsContainer = () => {
	document.title = createPageTitle(1);
	const [loader, setLoader] = useState<boolean>(false);
	const [notifications, updateNotifications] = useState<any>([]);
	const [vehicleMapByRegNumber, updateVehicleMapByRegNumber] = useState<any>({});

	useEffect(() => {
		UserService
			.getUserById()
			.then((userVehicles: any) => {
				userVehicles.forEach((vehicle: any) => {
					vehiclesByRegNumberMap[VehicleUtility.readRegistrationNumber(vehicle)] = vehicle;
				});
				updateVehicleMapByRegNumber(vehiclesByRegNumberMap);
			});

		setLoader(true);
		getRequest(
			API.NOTIFICATIONS,
			{
				_from: new Date(new Date().setHours(0, 0, 0)),
				_to: new Date(),
			}
		).then((response: any) => {
			if (response?.data) {
				updateNotifications(response?.data);
				updateFilteredNotifications(response?.data)
			}
			setLoader(false);
		}).catch((error: any) => {
			console.error(error);
			setLoader(false);
		});
	}, []);

	const [filteredVehiclesByRegNumber, setFilteredVehicleByRegNumber] = useState<any>([]);

	// @ts-ignore
	const getUniqueVehiclesByRegistrationNumber = () => {
		if (notifications?.length && Object.entries(vehicleMapByRegNumber).length) {
			const uniqueRegistrationNumbers = Array.from(new Set(notifications.map((notification: any) => notification.registration_number)));
			const filteredVehicles = uniqueRegistrationNumbers.map((registration_number: string) => {
				if (vehicleMapByRegNumber?.[registration_number]) {
					return vehicleMapByRegNumber[registration_number]
				}
			});
			setFilteredVehicleByRegNumber(filteredVehicles);
		}
	}

	useEffect(() => {
		// getUniqueVehiclesByRegistrationNumber();
	}, [notifications, vehicleMapByRegNumber])

	const [filteredNotifications, updateFilteredNotifications] = useState(notifications);

	const searchNotifications = (event?: any) => {
		if (event?.target?.value?.length) {
			const filteredNotificationsList = notifications.filter((notification: any) => notification?.title.split('_').join(' ').toLowerCase().includes(event.target.value.toLowerCase()) || notification?.registration_number?.toLowerCase().includes(event.target.value.toLowerCase()));
			updateFilteredNotifications(filteredNotificationsList);
			return;
		}
		updateFilteredNotifications(notifications);
	}

	const renderSidebarContent = (notifications: any) => {
		return (
			<>
				{
					notifications?.length && !loader
						? (notifications.map((notification: any, key: number) => <NotificationCard
							key={key}
							notification={notification}
							vehicle={vehicleMapByRegNumber[notification?.registration_number]}
						/>)
						)
						: loader
							? (<Skeleton variant={'rectangular'} />)
							: (<div className={'flex flex-center flex-justify-center'}>
								No notification found
							</div>)
				}
			</>
		);
	}

	return (
		<div className={'ev-sidebar-map-container'}>
			<Sidebar
				contentPadding={'0'}
				filters={
					{
						search: {
							show: true,
							label: 'Search notifications',
							placeholder: 'ex. battery soc',
							changeAction: searchNotifications
						}
					}
				}
				content={renderSidebarContent(filteredNotifications)}
			/>
			{
				loader
					? <Loader type={LOADER_TYPE.FULL_PAGE} />
					: <Map {...{ markers: filteredVehiclesByRegNumber, type: MapRenderTypes.MARKERS, renderMap: true }} />
			}
		</div>
	);
}

export default NotificationsContainer;
