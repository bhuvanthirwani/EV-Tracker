export const AppPath = {
	DASHBOARD: '/dashboard',
	CHARGING_STATION: '/charging-station',
	VEHICLES: '/vehicles',
	NOTIFICATIONS: '/notifications',
	MAINTENANCE: '/maintenance',
	USER: '/user',
	USER_VEHICLES_LIST: '/vehicles-list',
	USER_SETTINGS: '/settings',
	USER_SUPPORT: '/support',
	USER_BOOKINGS: '/bookings',
	RIDES_REPORT: '/rides-report',
	BATTERY_REPORT: '/battery-report',
	LOGIN: '/login',
	BOOKING: '/charging-station/book',
	TERMS_AND_CONDITIONS: '/terms-and-conditions',
	PRIVACY_POLICY: '/privacy-policy',
	REFUND_POLICY: '/refund-policy',
	CHANGE_PASSWORD: '/change-password',
	ERROR5xx: '/error-500',
	ERROR4xx: '/error-404',
	REPORTS: '/reports',
	PAYMENTS: '/pay',
	PAY_SUCCESS: '/success',
	PAY_FAILURE: '/failure',
	MARKETPLACE: '/marketplace',
	EXPIRED_PAGE: '/expired',
	VEHICLE_LIVE_LOCATION: '/live',
	SUBSCRIPTION: '/plans'
}

export const VehiclePaths = {
	ANALYTICS: `${AppPath.VEHICLES}/analytics`,
	RIDES: `${AppPath.VEHICLES}/rides`,
}

export const MarketplacePaths = {
	ChargingPass: `${AppPath.MARKETPLACE}/charging-pass`
}

export const UserPaths = {
	SETTINGS: `${AppPath.USER}/settings`,
	SUPPORT: `${AppPath.USER}/support`,
	BOOKINGS: `${AppPath.USER}/bookings`,
	VEHICLES_LIST: `${AppPath.USER}/vehicles-list`,
	CHANGE_PASSWORD: '/change-password'
}

export const PaymentPaths = {
	SUCCESS: `${AppPath.PAYMENTS}/success`,
	FAILURE: `${AppPath.PAYMENTS}/failure`
}

export default AppPath;
