import React, {
	ComponentType,
	lazy
} from 'react';
import {
	Route,
	Switch
} from 'react-router-dom';
import AppPath from './AppPath.constants';
import DOMLoader from './components/shared/loader/dom-loader.component';
import Error404 from './components/shared/Error404.component';
import User from './containers/user/user.container';

const AnalyticsDashboardContainer = lazy(() => import('./containers/analytics-dashboard/analytics-dashboard.container'));
const NotificationsContainer = lazy(() => import('./containers/notifications/notifications.container'));
const MaintenanceContainer = lazy(() => import('./containers/maintenance/maintenance.container'));
const ChargingStationsContainer = lazy(() => import('./containers/charging-stations/charging-stations.container'));
const VehiclesContainer = lazy(() => import('./containers/vehicles/vehicles.container'));
const Login = lazy(() => import('./containers/auth/login.component'));
const Error500 = lazy(() => import('./components/shared/Error500.component'));
const RidesReport = lazy(() => import('./containers/analytics-dashboard/components/rides-report/rides-report.component'));
const BatteryReport = lazy(() => import('./containers/analytics-dashboard/components/battery-report/battery-report.component'));
const BookCharging = lazy(() => import('./containers/charging-stations/components/book-charging/book-charging.component'));
const BookChargingConfirmation
	= lazy(() => import('./containers/charging-stations/components/book-charging-confirmation/book-charging-confirmation.component'));
// const TermsAndConditions = lazy(() => import('./containers/policies/terms-and-conditons.component'));
// const PrivacyPolicy = lazy(() => import('./containers/policies/privacy-policy'));
// const RefundPolicy = lazy(() => import('./containers/policies/refund-policy'));
const Reports = lazy(() => import('./containers/reports/reports.component'));
const VehicleLiveLocation = lazy(() => import('./containers/vehicles/components/live-update-sharing/live-update-sharing.component'));
const ExpiredPage = lazy(() => import('./containers/vehicles/components/live-update-sharing/expired-page.component'));

export interface RouteProps {
	path: string;
	key: string;
	exact: boolean;
	component: ComponentType;
	routes?: Array<RouteProps>;
	hideMenu?: boolean;
}

const Routes: Array<RouteProps> = [
	{
		path: AppPath.DASHBOARD,
		key: 'dashboard',
		exact: true,
		component: AnalyticsDashboardContainer,
	},
	{
		path: AppPath.BATTERY_REPORT,
		key: 'battery-report',
		exact: true,
		component: BatteryReport,
	},
	{
		path: AppPath.RIDES_REPORT,
		key: 'ride-report',
		exact: true,
		component: RidesReport,
	},
	{
		path: AppPath.VEHICLES,
		key: 'vehicles',
		exact: false,
		component: VehiclesContainer
	},
	{
		path: AppPath.CHARGING_STATION,
		key: 'charging_stations',
		exact: true,
		component: ChargingStationsContainer
	},
	{
		path: `${AppPath.CHARGING_STATION}/book`,
		key: 'book-charging-station',
		exact: true,
		component: BookCharging
	},
	{
		path: `${AppPath.CHARGING_STATION}/book/confirmation`,
		key: 'book-charging-station-confirmation',
		exact: true,
		component: BookChargingConfirmation
	},
	{
		path: AppPath.MAINTENANCE,
		key: 'maintenance',
		exact: true,
		component: MaintenanceContainer
	},
	{
		path: AppPath.NOTIFICATIONS,
		key: 'notifications',
		exact: true,
		component: NotificationsContainer
	},
	{
		path: AppPath.USER,
		key: 'user',
		exact: false,
		component: User
	},
	{
		path: '/error-500',
		key: 'error-500',
		exact: true,
		component: Error500
	},
	// {
	// 	path: AppPath.TERMS_AND_CONDITIONS,
	// 	key: 'terms-and-conditions',
	// 	exact: true,
	// 	component: TermsAndConditions
	// },
	// {
	// 	path: AppPath.PRIVACY_POLICY,
	// 	key: 'privacy-policy',
	// 	exact: true,
	// 	component: PrivacyPolicy
	// },
	// {
	// 	path: AppPath.REFUND_POLICY,
	// 	key: 'refund-policy',
	// 	exact: true,
	// 	component: RefundPolicy
	// },
	{
		path: AppPath.REPORTS,
		key: 'reports',
		exact: true,
		component: Reports
	},
	{
		path: AppPath.VEHICLE_LIVE_LOCATION + '/:id',
		key: 'live-location',
		exact: true,
		component: VehicleLiveLocation,
		hideMenu: true
	},
	{
		path: AppPath.EXPIRED_PAGE,
		key: 'expired-page',
		exact: true,
		component: ExpiredPage,
		hideMenu: true
	},
	{
		path: '*',
		key: 'error-404',
		exact: true,
		component: Error404
	}
];

export const RouteWithSubRoutes = (route: any) => {
	return (
		<Route
			path={route.path}
			exact={route.exact}
			render={(props: any) => <route.component {...props} routes={route.routes}/>}
		/>
	);
}

export const RenderRoutes = ({routes}: any) => {
	return (
		<React.Suspense fallback={<DOMLoader/>}>
			<Switch>
				<Route
					path={AppPath.LOGIN}
					key={'login'}
					exact
					component={Login}
				/>
				{routes.map((route: RouteProps) => <RouteWithSubRoutes {...route} />)}
			</Switch>
		</React.Suspense>
	);
}

export default Routes;
