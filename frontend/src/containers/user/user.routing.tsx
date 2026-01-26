import { lazy } from 'react';

import AppPath from '../../AppPath.constants';
import { RouteProps } from '../../routing';


const UserVehicleDetails = lazy(() => import('./vehicle-details/user-vehicle-details.component'));
const UserSupport = lazy(() => import('./support/user-support.component'));


const UserRoutes: Array<RouteProps> = [
	{
		path: `${AppPath.USER}${AppPath.USER_VEHICLES_LIST}`,
		key: 'user_vehicles_details',
		exact: true,
		component: UserVehicleDetails,
	},
	{
		path: `${AppPath.USER}${AppPath.USER_SUPPORT}`,
		key: 'user_support',
		exact: true,
		component: UserSupport,
	}
]

export default UserRoutes;
