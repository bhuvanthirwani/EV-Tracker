import React from 'react';
import {
	Dashboard,
	ElectricRickshaw,
	EvStation,
	Notifications
} from '@mui/icons-material';

import AppPath from '../../../AppPath.constants';

/* Defining the interface of the object that will be returned by the HeaderRoutes array. */
export interface NavigationProps {
	path: string;
	key: string;
	title: string;
	icon: {
		content: any,
		alt: string
	};
}

const HeaderRoutes: Array<NavigationProps> = [
	{
		path: AppPath.DASHBOARD,
		title: 'Dashboard',
		key: 'dashboard',
		icon: {
			content: <Dashboard />,
			alt: 'dashboard'
		}
	},
	{
		path: AppPath.VEHICLES,
		title: 'Vehicles',
		key: 'vehicles',
		icon: {
			content: <ElectricRickshaw />,
			alt: 'vehicles'
		}
	},
	{
		path: AppPath.CHARGING_STATION,
		title: 'Charging Stations',
		key: 'charging_stations',
		icon: {
			content: <EvStation />,
			alt: 'charging station'
		}
	},
	/*{
	 path: AppPath.MAINTENANCE,
	 title: 'Maintenance',
	 key: 'maintenance'
	 },*/
	{
		path: AppPath.NOTIFICATIONS,
		title: 'Notifications',
		key: 'notifications',
		icon: {
			content: <Notifications />,
			alt: 'notification'
		}
	},
	/*{
		path: AppPath.REPORTS,
		title: 'Reports',
		key: 'reports',
		icon: {
			content: <Article />,
			alt: 'report'
		}
	}*/
]

export default HeaderRoutes;
