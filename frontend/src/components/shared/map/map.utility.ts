import mapboxgl, { LngLatLike } from 'mapbox-gl';
import distance from '@turf/distance';
import { point } from '@turf/helpers';

import * as L from 'leaflet';
import {
	LatLng,
	LatLngExpression
} from 'leaflet';

export const MAPBOX_TOKEN = 'pk.eyJ1IjoiZGV2aGF4Y29kZXMiLCJhIjoiY21rdGh2MDNqMXFtNDNlcTB4ZW96Z2hzNCJ9.FfBPSIOc7_IzXs2dptML2A';

export const calculateMapBounds = (coordinates: Array<LngLatLike>) => {
	const bounds = coordinates.reduce(function (bounds, coordinate) {
		return bounds.extend(coordinate)
	}, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));

	return bounds;
}

export const MapRenderTypes = {
	MARKERS: 'markers',
	PATH: 'path',
	LIVE_SPEED: 'live_speed',
	CHARGING_HUBS: 'charging_hubs',
	DIRECTIONS: 'directions'
}

export const defaultCoordinates: LngLatLike = {
	lng: -98.5795,
	lat: 39.8283
};

export const leafletDefaultCoordinates: LatLngExpression = L.latLng(defaultCoordinates)

export const defaultZoom = 4;
export const minZoom = 2;
export const maxZoom = 20;
export const defaultTileStyleNavigation = 'mapbox://styles/mapbox/navigation-day-v1';
export const defaultTileStyle = 'mapbox://styles/mapbox/light-v10';

export const calculateDistance = (source: any, destination: any) => distance(
	point([source.longitude, source.latitude]),
	point([destination.longitude, destination.latitude]),
	{ units: 'kilometers' })
	.toFixed(1);

export const calculateMapBoundsLeaflet = (coordinates: Array<LatLng>) => {
	const bounds = coordinates.reduce(function (bounds, coordinate) {
		return bounds.extend(coordinate)
	}, L.latLngBounds(coordinates[0], coordinates[0]));

	return bounds;
}

export const createMarker = (status: number, rotation?: number, markerType?: string): HTMLElement => {
	const marker = document.createElement('div');
	let className = '';

	switch (markerType) {
		case MarkerType.VEHICLES:
			switch (status) {
				case 0: className = 'direction-marker-red'; break;
				case 2: className = 'direction-marker-orange'; break;
				default: className = 'direction-marker';
			}
			break;
		case MarkerType.CHARGERS:
			className = 'charging-hub-marker vehicle-marker-directional'
			break;

		default:
			break;
	}

	marker.className = className;
	// vehicle_marker.style.transform = `rotateZ(${rotation}deg)`;

	return marker;
}

export const createVehicleLabel = (rotation: number, title: string) => {
	const vehicleMarkerLabel = document.createElement('div');
	vehicleMarkerLabel.style.transform = `rotate(${rotation}deg)`;
	vehicleMarkerLabel.innerHTML = `<span class="vehicle-list-marker-label">${title}</span>`;

	return vehicleMarkerLabel;
}

export const getDefaultBoundingBox = () => {
	// US Bounding Box: approx SW (24.39, -125.0), NE (49.38, -66.93)
	const southWest = new L.LatLng(24.396308, -125.0);
	const northEast = new L.LatLng(49.384358, -66.93457);
	return new L.LatLngBounds(southWest, northEast).toBBoxString();
}

export const defaultBoundingBox = getDefaultBoundingBox();


export const MarkerType = {
	CHARGERS: 'chargers',
	VEHICLES: 'vehicles'
}
