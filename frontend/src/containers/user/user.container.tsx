import React from 'react';
import {RenderRoutes} from '../../routing';
import UserRoutes from './user.routing';
import { createPageTitle } from '../../utils';

const User = () => {
	document.title = createPageTitle(1);
	return (
		<RenderRoutes routes={UserRoutes} />
	);
}

export default User;
