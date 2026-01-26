import React from 'react';
import './vehicle.container.css';
import {
	Route,
	Switch
} from 'react-router-dom';

import AppPath, { VehiclePaths } from '../../AppPath.constants';
import VehicleListComponent from './components/vehicle-list.component';
import VehicleAnalyticsComponent from './components/vehicle-analytics/vehicle-analytics.component';
import VehicleRidesComponent from './components/vehicle-rides/vehicle-rides.component';
import { createPageTitle } from '../../utils';

const VehiclesContainer = () => {
    if (location.pathname.split('/').length > 2) {
		document.title = 'Vehicle ' + createPageTitle(2);
	} else {
		document.title = createPageTitle(1);
	}

	return (
		<Switch>
			<Route exact={true} path={AppPath.VEHICLES} component={VehicleListComponent} />
			<Route exact={true} path={`${VehiclePaths.ANALYTICS}/:id`} component={VehicleAnalyticsComponent}/>
			<Route exact={true} path={`${VehiclePaths.RIDES}/:id`} component={VehicleRidesComponent}/>
		</Switch>
	);
}

export default VehiclesContainer;
