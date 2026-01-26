import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import getRefreshToken from './containers/auth/refresh-token.api';
import { getConfigByKey } from './firebase.service';
import '/src/stylesheet.css';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from './components/shared/map/map.utility';

mapboxgl.accessToken = MAPBOX_TOKEN;



if (localStorage.getItem('auth')) {
	if (!['/login'].includes(location.pathname)) {
		let timeout;
		(async () => {
			const configVal = await getConfigByKey('token_timeout');
			timeout = parseInt(configVal);
			if (timeout) {
				getRefreshToken(timeout);
			}
		})();
	} else {
		localStorage.clear();
		location.reload();
	}
}

const appContainer = document.getElementById('app');
const appRoot = createRoot(appContainer!);
appRoot.render(<App />);
