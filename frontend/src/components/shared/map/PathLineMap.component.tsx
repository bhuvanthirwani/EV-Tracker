import Icon from '@mui/material/Icon';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import along from '@turf/along';
import bearing from '@turf/bearing';
import { point } from '@turf/helpers';
import length from '@turf/length';
import { enIN } from 'date-fns/locale';
import mapboxgl, { LngLatLike } from 'mapbox-gl';
import React, { useEffect, useRef, useState } from 'react';
import { MapRenderTypes, calculateMapBounds, defaultCoordinates, defaultTileStyle, defaultZoom, MAPBOX_TOKEN } from './map.utility';
import { formatDateWithYearAndTime } from '../../../utils/date.utils';

mapboxgl.accessToken = MAPBOX_TOKEN;
// @ts-ignore
import tripIcon from '../../../assets/images/map/ev-marker.svg';

let markersArray: Array<mapboxgl.Marker> = [];
// Used to increment the value of the point measurement against the route.
let counterInit = 0;
// Number of steps to use in the arc and animation, more steps means
// a smoother arc and animation, but too many steps will result in a
// low frame rate
const stepsInit = 5000;

let animationFrameId: any;


interface PlayState {
	isPlay: boolean
	isPause: boolean
	isStop: boolean
}
const initPlayState: PlayState = {
	isPlay: true,
	isPause: false,
	isStop: false
}

const PathLineMap = (props: any) => {
	const { renderMap, markers, overlay, dateRangePicker, markerMeta } = props;

	const mapContainer = useRef(null);
	const map = useRef(null);
	let vehicleMarkerLocation: any;

	const [playState, setPlayState] = useState<PlayState>(initPlayState);
	const [pathLineF, updatePathLine] = useState<any>();
	const [vehicleCurrentPosition, updateVehicleCurrentPosition] = useState<any>();
	const [bounds, updateBounds] = useState<any>();

	// const [coordinates, updateCoordinates] = useState(defaultCoordinates);

	/***
	 * To intialize map
	 */
	useEffect(() => {
		if (!renderMap) return;

		if (map.current) return; // initialize map only once
		// @ts-ignore
		map.current = new mapboxgl.Map({
			// @ts-ignore
			container: mapContainer.current,
			style: defaultTileStyle,
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
			attributionControl: false
		}).addControl(new mapboxgl.NavigationControl({ showCompass: false, showZoom: true, visualizePitch: true }));

		if (map && map.current) {
			counterInit = 0;
			setPlayState(playState);

			// Remove the Traveller marker from previous simulations
			if (renderMap) {
				// @ts-ignore
				if (map.current.getLayer('traveller')) map.current.removeLayer('traveller');
				// @ts-ignore
				if (map.current.getSource('traveller')) map.current.removeSource('traveller');
			}
		}

	}, [renderMap]);

	useEffect(() => {
		const coordinates: Array<LngLatLike> = [];

		markers?.length && markers?.forEach((point: any) => coordinates.push([parseFloat(point.lon), parseFloat(point.lat)]));

		if (coordinates.length) {
			const pathLine = {
				type: 'Feature',
				geometry: {
					type: 'LineString',
					coordinates
				}
			};

			updatePathLine(pathLine);
		}
	}, [markers, markerMeta?.last_moved_at]);

	useEffect(() => {
		if (markers) {
			if (markersArray.length) {
				markersArray.forEach(marker => marker.remove());
				markersArray = [];
			}
		}
	}, [pathLineF]);


	useEffect(() => {
		if (pathLineF && pathLineF?.geometry?.coordinates?.length && map.current) {
			// @ts-ignore
			map.current?.on('idle', () => {
				// @ts-ignore
				if (map.current?.getSource('route')) {
					// @ts-ignore
					map.current.getSource('route').setData(null); map.current.getSource('route').setData(pathLineF);
				} else {
					// @ts-ignore
					map.current.addSource('route', {
						type: 'geojson',
						data: pathLineF
					});

					// @ts-ignore
					map.current.addLayer({
						id: 'route',
						type: 'line',
						source: 'route',
						layout: {
							'line-join': 'round',
							'line-cap': 'round',
						},
						paint: {
							'line-color': '#09213d',
							'line-width': 4,
						},
					});
				}
			});

			const coordinates = pathLineF?.geometry?.coordinates;
			const tripStartMarkerCoordinates = coordinates[0];
			const tripEndMarkerCoordinates = coordinates.at(-1);
			updateVehicleCurrentPosition(tripStartMarkerCoordinates);

			const tripStartMarkerStyle = document.createElement('div');
			tripStartMarkerStyle.className = 'flex flex-center flex-justify-center ride-marker';
			tripStartMarkerStyle.innerText = 'S'
			tripStartMarkerStyle.title = 'Start location'
			const startMarker = markerMeta?.start;

			const tripStartMarker =
				new mapboxgl.Marker(tripStartMarkerStyle)
					.setLngLat(tripStartMarkerCoordinates)
					.setPopup(new mapboxgl.Popup({ closeOnMove: true, closeButton: false })
						.setHTML(`<div class='flex flex-column trip-marker-label'><div>Odometer: ${startMarker?.odo} kms</div><div>SoC: ${startMarker?.soc}%</div><div>Time: ${formatDateWithYearAndTime(startMarker?.time)}</div><div>`))
					.addTo(map.current);

			const tripEndMarkerStyle = document.createElement('div');
			tripEndMarkerStyle.className = tripStartMarkerStyle.className;
			tripEndMarkerStyle.innerText = 'E'
			tripEndMarkerStyle.title = 'End location'
			const endMarker = markerMeta?.end;

			const tripEndMarker =
				new mapboxgl.Marker(tripEndMarkerStyle)
					.setLngLat(tripEndMarkerCoordinates as [number, number] | mapboxgl.LngLat | { lng: number; lat: number } | { lon: number; lat: number })
					.setPopup(new mapboxgl.Popup({ closeOnMove: true, closeButton: false })
						.setHTML(`<div class='flex flex-column trip-marker-label'><div>Odometer: ${endMarker?.odo} kms</div><div>SoC: ${endMarker?.soc}%</div><div>Time: ${formatDateWithYearAndTime(endMarker?.time) || formatDateWithYearAndTime(markerMeta?.last_moved_at)}</div><div>`))
					.addTo(map.current);

			markersArray.push(tripStartMarker, tripEndMarker);

			if (coordinates) {
				const mapBound = calculateMapBounds(coordinates);
				updateBounds(mapBound);
				// @ts-ignore
				map.current.fitBounds(mapBound, { padding: 140, screenSpeed: 1, maxDuration: 2000 });
			}
		}
	}, [pathLineF?.geometry?.coordinates || pathLineF]);

	const playTrip = (): void => {
		setPlayState({
			isPlay: false,
			isPause: true,
			isStop: true,
		});

		const lineDistance = length(pathLineF);
		const arc = [];

		// Draw an arc between the `origin` & `destination` of the two points
		for (let i = 0; i < lineDistance; i += lineDistance / stepsInit) {
			const segment = along(pathLineF, i);
			arc.push(segment?.geometry?.coordinates);
		}

		// Update the route with calculated arc coordinates
		pathLineF.geometry.coordinates = arc;

		// @ts-ignore
		if (!map.current?.hasImage('traveller_icon')) {
			// @ts-ignore
			map.current?.addImage(
				'traveller_icon',
				document.getElementById('traveller_icon') as HTMLImageElement
			);
		}

		// @ts-ignore
		if (!map.current?.getSource('traveller')) {
			// @ts-ignore
			map.current?.addSource('traveller', {
				type: 'geojson',
				data: {
					type: 'Feature',
					properties: {},
					geometry: {
						type: 'Point',
						coordinates: vehicleCurrentPosition
					}
				}
			});

			// @ts-ignore
			map.current?.addLayer({
				id: 'traveller',
				source: 'traveller',
				type: 'symbol',
				layout: {
					'icon-image': 'traveller_icon',
					'icon-rotate': ['get', 'bearing'],
					'icon-rotation-alignment': 'map',
					'icon-allow-overlap': false,
					'icon-ignore-placement': true,
					'icon-size': 0.6
				}
			});
		}

		// @ts-ignore
		vehicleMarkerLocation = map.current?.getSource('traveller');
		vehicleMarkerLocation = vehicleMarkerLocation._data;

		animate();

	}

	const animate = (): void => {
		const steps: number = stepsInit;
		const counter: number = counterInit;

		const start = pathLineF.geometry.coordinates[counter >= steps ? counter - 1 : counter];
		const end = pathLineF.geometry.coordinates[counter >= steps ? counter : counter + 1];

		if (!start || !end) {
			return;
		}

		// update traveller geometry
		vehicleMarkerLocation.geometry.coordinates = pathLineF.geometry.coordinates[counter];

		// to control icon rotation
		vehicleMarkerLocation.properties.bearing = bearing(point(start), point(end));

		// Update the source with this new data
		// @ts-ignore
		(map.current.getSource('traveller') as any)?.setData(vehicleMarkerLocation);

		// @ts-ignore
		map.current.flyTo({
			center: vehicleMarkerLocation.geometry.coordinates,
			essential: true,
			zoom: 14,
			speed: 2
		});

		// Request the next frame of animation as long as the end has not been reached
		if (counter < steps) {
			animationFrameId = requestAnimationFrame(animate);
		}

		if (counter >= steps) {
			setPlayState({
				isPlay: false,
				isPause: false,
				isStop: true,
			});
		}
		counterInit += 1;
	}

	const pauseTrip = (): void => {
		setPlayState({
			isPlay: true,
			isPause: false,
			isStop: true
		});
		cancelAnimationFrame(animationFrameId);
	}

	const stopTrip = (): void => {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = undefined;
		counterInit = 0;

		setPlayState({
			isPlay: true,
			isPause: false,
			isStop: false,
		});
		// @ts-ignore
		map.current.removeLayer('traveller'); map.current.removeSource('traveller'); map.current.fitBounds(bounds, { padding: 20 });
	}

	return (
		<div>
			{
				(MapRenderTypes.PATH === props.type
					&& markers) ? (
					<div className={'map-header'}>
						{
							renderMap
							&& (
								<div className={'flex flex-center-gap'} title={'Go back to Analytics'} onClick={() => overlay?.action()}>
									<Icon className='material-symbols-outlined'>arrow_back</Icon>
									<span>Analytics</span>
								</div>
							) || <div />
						}

						{
							markers?.length
							&& (
								<div className={'map-header-actions flex flex-center-gap'}>
									{
										playState.isPlay && <button
											className="ev-btn"
											onClick={playTrip}
											title="play trip"
										>
											<Icon className='material-symbols-outlined'>play_arrow</Icon>
										</button>
									}

									{
										playState.isPause &&
										<button
											className="ev-btn"
											onClick={pauseTrip}
											title="play trip"
										>
											<Icon className='material-symbols-outlined'>pause</Icon>
										</button>
									}

									{
										playState.isStop &&
										<button
											className="ev-btn"
											onClick={stopTrip}
											title="stop trip"
										>
											<Icon className='material-symbols-outlined'>stop</Icon>
										</button>
									}
								</div>
							) || <div />
						}
						{
							dateRangePicker && (
								<div className={'map-header-date-container flex flex-center-gap'}>
									<LocalizationProvider adapterLocale={enIN} dateAdapter={AdapterDateFns}>
										<DatePicker
											label="From Date"
											value={dateRangePicker?.fromDate}
											minDate={dateRangePicker?.minDate}
											maxDate={dateRangePicker?.toDate}
											onChange={(newValue: Date) => dateRangePicker?.changeFromDateAction(newValue)}
											slotProps={{ textField: { variant: 'outlined', disabled: true } }}
										/>

										<DatePicker
											label="To Date"
											value={dateRangePicker?.toDate}
											onChange={(newValue: Date) => dateRangePicker?.changeToDateAction(newValue)}
											slotProps={{ textField: { variant: 'outlined', disabled: true } }}
											minDate={new Date(dateRangePicker?.fromDate)}
											maxDate={new Date()}
										/>
									</LocalizationProvider>
								</div>
							)
						}
						<img style={{ display: 'none' }} id="traveller_icon" alt="traveller" src={tripIcon} />
					</div>
				) : null
			}

			{
				renderMap
					? (
						<div
							ref={mapContainer}
							className={markers?.length ? 'map-container reduce-map-header-height' : 'map-container'}
							style={{ position: 'absolute', width: '74%' }}
						/>
					) : null
			}

			{
				overlay?.show && props.overlay?.action()
			}
		</div>
	);
}

export default PathLineMap;
