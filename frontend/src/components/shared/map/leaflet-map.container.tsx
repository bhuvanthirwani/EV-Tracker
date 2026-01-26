import React, {
	useEffect,
	useRef,
	useState
} from 'react';
import 'mapbox-gl';
import './gl-leaflet';
import * as L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import './map.style.css';
import {
	createVehicleLabel,
	createMarker,
	defaultTileStyle,
	defaultZoom,
	leafletDefaultCoordinates,
	MapRenderTypes,
	maxZoom,
	minZoom,
	MarkerType,
	MAPBOX_TOKEN
} from './map.utility';
import VehicleUtility from '../../../utils/vehicle.utility';
import { ChargerInfoPopup, VehicleInfoPopUp } from './map-popup-template';

let clusters: any;

const LeafletMap = (props: any) => {
	let { markers, type, locationKey, updateBoundingBox, renderMap, markerType } = props;

	const mapContainer = useRef<any>(null);
	const map = useRef<any>(null);

	const [coordinates, updateCoordinates] = useState(leafletDefaultCoordinates);

	const customZoomResetControl = L.Control.extend({
		options: {
			position: 'topright',

		},
		onAdd: (map: any) => {
			const container = L.DomUtil.create('div');
			container.innerHTML = '<a alt=\'reset view\'>Reset View</a>';
			container.className = 'leaflet-control leaflet-bar';
			container.addEventListener('click', (event) => {
				if (event) {
					map.setView(leafletDefaultCoordinates, defaultZoom)
				}
			});
			return container;
		},
	});

	useEffect(() => {
		if (!renderMap) return;

		if (map.current) return; // initialize map only once
		map.current = L.map(mapContainer.current, {
			center: coordinates,
			zoom: defaultZoom,
			maxZoom,
			attributionControl: false,
			preferCanvas: true,
			markerZoomAnimation: true,
			scrollWheelZoom: 'center',
			minZoom,
			worldCopyJump: false,
			zoomAnimation: true,
			fadeAnimation: true,
		});

		L.mapboxGL({
			style: defaultTileStyle,
			accessToken: MAPBOX_TOKEN
		}).addTo(map.current);

		clusters = L.markerClusterGroup({
			spiderfyOnMaxZoom: true,
			showCoverageOnHover: true,
			animate: true,
			chunkedLoading: true,
			removeOutsideVisibleBounds: true
		});

		if (map && map.current) {
			map.current.on('load', () => {
				updateCoordinates(leafletDefaultCoordinates);
			}, [defaultZoom, leafletDefaultCoordinates]);

			new customZoomResetControl().addTo(map.current);
			map.current.zoomControl.setPosition('topright');

			map.current.addEventListener('zoomend', (event: any) => {
				updateBoundingBox(map.current?.getBounds().toBBoxString());
			});

			map.current.addEventListener('moveend', (event: any) => {
				updateBoundingBox(map.current?.getBounds().toBBoxString())
			});
		}

	}, [renderMap]);

	useEffect(() => {
		switch (type) {
			case MapRenderTypes.MARKERS:
			case MapRenderTypes.CHARGING_HUBS:
			default:
				addMarkers();
		}
	}, [type, markers]);

	const addMarkers = () => {
		clusters?.clearLayers();
		const markerArray = [];

		if (typeof (markers) === typeof ({})) {
			markers = Object.values(markers);
		}

		if (markers && markers.length && locationKey) {
			for (let i = 0; i < markers?.length; i++) {
				const marker = markers[i];

				if (marker?.location) {
					const vehicleStatus = marker?.status?.vehicle;
					const rotation = marker?.location?.heading;

					const title = VehicleUtility.readVehicleMarkerTitle(marker);

					let markerLabel = null;
					const markerHTML = createMarker(vehicleStatus, rotation, markerType);

					if (MarkerType.VEHICLES === markerType) {
						markerLabel = createVehicleLabel(rotation, title);
						markerLabel.insertAdjacentElement('afterbegin', markerHTML);
					}

					const customIcon = L.divIcon({
						html: markerLabel || markerHTML || '',
						shadowSize: [10, 10],
					});

					let lat = undefined,
						long = undefined;

					if (locationKey.length === 1) {
						lat = marker?.[locationKey[0]]?.latitude;
						long = marker?.[locationKey[0]]?.longitude;
					} else {
						lat = marker?.[locationKey[0]]?.[locationKey[1]]?.latitude;
						long = marker?.[locationKey[0]]?.[locationKey[1]]?.longitude;
					}

					const latLng = new L.LatLng(lat, long);
					const mapMarker = L.marker(
						latLng,
						{
							icon: customIcon,
							title: VehicleUtility.readRegistrationNumber(marker)
						}
					);

					let popup = L.popup();
					if (markerType === MarkerType.CHARGERS) {
						popup = L.popup({ closeOnClick: false, keepInView: true }).setLatLng(latLng).setContent(ChargerInfoPopup(marker));
					} else {
						popup = L.popup({ closeOnClick: false, keepInView: true }).setLatLng(latLng).setContent(VehicleInfoPopUp(marker));
					}
					mapMarker.bindPopup(popup);

					markerArray.push(mapMarker);
				}
			}
			clusters.addLayer(L.featureGroup(markerArray));

			clusters.addTo(map.current);
		}
	}

	return (
		<div
			ref={mapContainer}
			className={(MapRenderTypes.PATH === type) && markers?.length ? 'map-container reduce-map-header-height' : 'map-container'}
		/>
	);
};

export default LeafletMap;
