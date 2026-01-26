import React, {
	memo,
	useEffect,
	useRef,
	useState
} from 'react';
import mapboxgl, { Marker } from 'mapbox-gl';
// @ts-ignore
import * as MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import './map.style.css';
import {
	calculateMapBounds,
	createVehicleLabel,
	createMarker,
	defaultCoordinates,
	defaultZoom,
	MapRenderTypes,
	defaultTileStyle,
	MAPBOX_TOKEN
} from './map.utility';
import { formatTiming } from '../../../utils/date.utils';
import VehicleUtility from '../../../utils/vehicle.utility';

mapboxgl.accessToken = MAPBOX_TOKEN;
let markersArray: Array<mapboxgl.Marker> = [];

let directionMarkers: Array<mapboxgl.Marker> = [];


const Map = memo((props: any) => {
	const { markers, type, renderMap, overlay, start, end, markerDisplay, chargingHubName, telemetryStatus, tile } = props;

	const mapContainer = useRef<any>(null);
	const map = useRef<any>(null);

	let vehicleElement: HTMLElement = document.createElement('div');
	const vehicleMarker = new mapboxgl.Marker({
		element: vehicleElement
	});

	// const [coordinates, updateCoordinates] = useState(defaultCoordinates);

	const [vehicleChargingStationTime, setVehicleChargingStationTime] = useState<number>(0);
	const [vehicleChargingStationDistance, setVehicleChargingStationDistance] = useState<number>(0);

	useEffect(() => {
		if (!renderMap) return;
		if (map.current) return; // initialize map only once

		map.current = new mapboxgl.Map({
			container: mapContainer.current,
			style: tile || defaultTileStyle,
			center: defaultCoordinates,
			zoom: defaultZoom,
			minZoom: 3,
			renderWorldCopies: false,
			fitBoundsOptions: {
				center: defaultCoordinates,
				zoom: defaultZoom,
				padding: 20
			},
			hash: false,
			logoPosition: 'bottom-right',
			attributionControl: false
		}).addControl(new mapboxgl.NavigationControl({ showCompass: false, showZoom: true, visualizePitch: true }));

		// if (map && map.current) {
		// 	map.current.on('load', () => {
		// 		updateCoordinates(defaultCoordinates);
		// 	}, [defaultCoordinates]);
		// }
	}, [renderMap]);

	useEffect(() => {
		if (markers?.length || markersArray?.length) {
			if (markersArray.length) {
				markersArray.forEach(marker => marker.remove());
				markersArray = [];
			}
		}
	}, [markers?.length, markers, type]);

	useEffect(() => {
		switch (type) {
			case MapRenderTypes.MARKERS:
			case MapRenderTypes.CHARGING_HUBS:
				addMarkers();
				break;
			case MapRenderTypes.DIRECTIONS: {
				if (directionMarkers.length) {
					directionMarkers.forEach(marker => marker.remove());
					directionMarkers = [];
				}
				addDirections();
			}
				break;
			default:
				addMarkers();
		}
	}, [markers, markers?.length, type, () => start || end])

	const addMarkers = () => {
		const geojson: any = {
			type: 'FeatureCollection',
			features: [],
		};
		const layerIDs = [];
		geojson.features = [];

		markers && Object.entries(markers).forEach(([key, vehicle]: [any, any]) => {
			if (vehicle && VehicleUtility.readRegistrationNumber(vehicle)) {
				const markerDisplay = VehicleUtility.readVehicleMarkerTitle(vehicle);
				geojson.features.push({
					type: 'Feature',
					geometry: {
						type: 'Point',
						coordinates: [
							vehicle?.location?.coordinate?.longitude || vehicle?.location?.coordinate[1],
							vehicle?.location?.coordinate?.latitude || vehicle?.location?.coordinate[0],
						],
					},
					properties: {
						title: markerDisplay,
						description: markerDisplay,
						iconSize: [30, 30],
						boxShadow: [2, 14, 3, 9],
						rotation: vehicle?.location?.heading,
						status: vehicle?.status?.vehicle,
						location: vehicle?.location?.coordinate,
						speed: vehicle?.speed
					}
				});
				layerIDs.push(markerDisplay);
			}

			if (type === MapRenderTypes.CHARGING_HUBS) {
				geojson.features.push({
					type: 'Feature',
					geometry: {
						type: 'Point',
						coordinates: [
							vehicle?.location?.longitude,
							vehicle?.location?.latitude,
						],
					},
					properties: {
						iconSize: [30, 30],
						boxShadow: [2, 14, 3, 9],
						title: vehicle?.hub_name
					}
				});
			}
		});

		geojson?.features?.length && geojson.features.forEach((marker: any) => {
			const rotation = marker?.properties?.rotation;
			const status = marker?.properties?.status;
			const coordinates = marker?.geometry?.coordinates;

			if (type === MapRenderTypes.MARKERS) {
				const vehicleMarkerLabel = createVehicleLabel(rotation, marker?.properties?.title);
				vehicleElement = createMarker(status);
				vehicleMarkerLabel.append(vehicleElement);

				const markerToAdd: any = new mapboxgl.Marker(vehicleMarkerLabel)
					.setLngLat(coordinates)
					.setRotation(rotation);

				markersArray.push(markerToAdd);
			}

			if (type === MapRenderTypes.LIVE_SPEED && coordinates[0]) {
				const popup = new mapboxgl.Popup(
					{
						offset: 25,
						closeButton: false,
						closeOnClick: false,
						closeOnMove: false
					})
					.setLngLat(coordinates)
					.setHTML(`<div class="live-speed-popup"><span class="speed">${telemetryStatus ? marker?.properties?.speed : '⚠️'}</span><span>km/h</span></div>`);

				if (status === 0) {
					vehicleElement.className = 'direction-marker-red vehicle-marker-directional live-speed-marker';
				} else if (status === 2) {
					vehicleElement.className = 'direction-marker-orange vehicle-marker-directional live-speed-marker';
				} else {
					vehicleElement.className = 'direction-marker vehicle-marker-directional live-speed-marker';
				}

				vehicleMarker
					.setLngLat(coordinates)
					.setRotation(rotation)
					.setPopup(popup);

				markersArray.push(vehicleMarker);
			}

			if (type === MapRenderTypes.CHARGING_HUBS) {
				const chargingHubMarker = document.createElement('div');
				chargingHubMarker.className = 'charging-hub-marker';
				chargingHubMarker.title = marker?.properties?.title;

				markersArray.push(new mapboxgl.Marker(chargingHubMarker)
					.setLngLat(coordinates));
			}
		});

		if (markersArray?.length) {
			markersArray.forEach((mark: Marker) => mark.addTo(map.current).togglePopup());
		}

		if (markersArray.length === 1) {
			const flyToCoordinate = markers?.[0]?.location?.coordinate || markers?.[0]?.location || markers?.[0];
			map.current.flyTo({
				center: [flyToCoordinate?.longitude || flyToCoordinate[1], flyToCoordinate?.latitude || flyToCoordinate[0]],
				essential: true,
				zoom: location.pathname.includes('live') ? 14 : 15,
				speed: 4,
				curve: 0.5,

			});
		} else {
			const coordinatesArray = geojson.features.length && geojson.features.map((json: any) => json.geometry.coordinates);
			if (coordinatesArray && !coordinatesArray?.[0].includes(undefined)) {
				const mapBound = calculateMapBounds(coordinatesArray);
				map.current.fitBounds(mapBound, { padding: 100, screenSpeed: 1, maxDuration: 2000 });
			}
		}
	}

	const addDirections = () => {
		const directions = new MapboxDirections({
			profile: 'mapbox/driving-traffic',
			alternatives: false,
			interactive: false,
			unit: 'metric',
			controls: {
				inputs: false,
				instructions: false
			},
			styles: [
				{
					id: 'directions-route-line-casing',
					type: 'line',
					source: 'directions',
					layout: {
						'line-cap': 'round',
						'line-join': 'round'
					},
					paint: {
						'line-color': '#00cb9e',
						'line-width': 12
					},
					filter: ['all', ['in', '$type', 'LineString'], ['in', 'route', 'selected']]
				},
				{
					id: 'directions-route-line',
					type: 'line',
					source: 'directions',
					layout: {
						'line-cap': 'butt',
						'line-join': 'round'
					},
					paint: {
						'line-color': {
							property: 'congestion',
							type: 'categorical',
							default: '#00cb9e',
							stops: [
								['unknown', '#4882c5'],
								['low', '#4882c5'],
								['moderate', '#f09a46'],
								['heavy', '#e34341'],
								['severe', '#8b2342']
							]
						},
						'line-width': 7
					},
					filter: ['all', ['in', '$type', 'LineString'], ['in', 'route', 'selected']]
				},
				{
					id: 'directions-waypoint-point',
					type: 'circle',
					source: 'directions',
					paint: {
						'circle-radius': 0,
						'circle-color': '#00cb9e'
					},
					filter: ['all', ['in', '$type', 'Point'], ['in', 'id', 'waypoint']]
				},
				{
					id: 'directions-origin-point',
					type: 'symbol',
					source: 'directions'
				},
				{
					id: 'directions-origin-label',
					type: 'symbol',
					source: 'directions',
					layout: {
						'icon-allow-overlap': false,
						'text-field': markerDisplay,
						'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
						'text-size': 0,
						'icon-size': 0,
						'text-justify': 'right',
						'icon-anchor': 'bottom-right',
					},
					paint: {
						'text-color': '#ffffff',
						'text-halo-color': '#ff697b',
						'text-halo-width': 30,
					},
					filter: ['all', ['in', '$type', 'Point'], ['in', 'marker-symbol', 'A']]
				},
				{
					id: 'directions-destination-point',
					type: 'circle',
					source: 'directions',
					paint: {
						'circle-radius': 0,
						'circle-color': '#000000',
						'circle-stroke-color': '#00d8a8',
					},
					filter: ['all', ['in', '$type', 'Point'], ['in', 'marker-symbol', 'B']]
				},
				{
					id: 'directions-destination-label',
					type: 'symbol',
					source: 'directions',
					layout: {
						'icon-allow-overlap': true,
						'icon-size': 0,
						'icon-anchor': 'center',

					},
					filter: ['all', ['in', '$type', 'Point'], ['in', 'marker-symbol', 'B']]
				}
			],
			accessToken: mapboxgl.accessToken
		});

		if (start) {
			directions.setOrigin([start?.coordinate?.longitude, start?.coordinate?.latitude]);

			const vehicleMarkerLabel = document.createElement('div');
			// const rotation = start?.heading;
			// style="transform: rotateZ(${rotation}deg)"
			vehicleMarkerLabel.innerHTML = `<span class="vehicle-list-marker-label">${markerDisplay}</span>`;

			const vehicle_marker = document.createElement('div');
			vehicle_marker.className = 'direction-marker';
			vehicleMarkerLabel.append(vehicle_marker);

			const startMarker = new mapboxgl.Marker(vehicleMarkerLabel)
				.setLngLat([start?.coordinate?.longitude, start?.coordinate?.latitude])
				.setRotation(start?.heading)
				.addTo(map.current);

			directionMarkers.push(startMarker);
		}
		if (end) {
			directions.setDestination([end?.longitude, end?.latitude]);

			const chargingHubMarker = document.createElement('div');
			chargingHubMarker.className = 'charging-hub-marker vehicle-marker-directional';
			chargingHubMarker.title = chargingHubName;

			const endMarker = new mapboxgl.Marker(chargingHubMarker)
				.setLngLat([end?.longitude, end?.latitude])
				.addTo(map.current);

			directionMarkers.push(endMarker);
		}

		directions.on('route', (response: any) => {
			map.current.addControl(directions, 'top-left');

			setVehicleChargingStationDistance(Math.floor(response?.route?.[0]?.distance / 1000));
			setVehicleChargingStationTime(Math.floor(response?.route?.[0]?.duration));
		});

		if (start?.coordinate?.latitude && start?.coordinate?.longitude && end?.latitude && end?.longitude) {
			map.current.fitBounds(calculateMapBounds([[start?.coordinate?.longitude, start?.coordinate?.latitude], [end?.longitude, end?.latitude]]), { padding: 100, screenSpeed: 0.2, maxDuration: 2000 });
		}
	}

	return (
		<>
			{
				MapRenderTypes.DIRECTIONS === type
				&& vehicleChargingStationDistance
				&& vehicleChargingStationTime
				&& (
					<div className={'map-header flex flex-center-gap'} style={{ flexFlow: 'wrap' }}>
						{
							vehicleChargingStationDistance
							&& (
								<div>
									<span>Approx. Distance: {vehicleChargingStationDistance} kms</span>
								</div>
							)
						}

						{
							vehicleChargingStationTime
							&& (
								<div>
									| <span>Approx. Time: {formatTiming(vehicleChargingStationTime)}</span>
								</div>
							)
						}
					</div>
				)
			}
			{
				renderMap && !location.pathname.includes('live')
					? (<div ref={mapContainer} className={MapRenderTypes.PATH === type && markers?.length ? 'map-container reduce-map-header-height' : 'map-container'} />)
					: (<div ref={mapContainer} className={MapRenderTypes.PATH === type && markers?.length ? 'map-container reduce-map-header-height' : 'map-container'}>{overlay?.show && overlay?.action()}</div>)
			}
			{
				renderMap && location.pathname.includes('live') && (<div ref={mapContainer} className={'share_live-map-container'} />)
			}
		</>
	);
});

export default Map;
