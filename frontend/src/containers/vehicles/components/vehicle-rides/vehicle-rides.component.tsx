import React, { useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import Loader from '../../../../components/shared/loader/loader.component';
import Sidebar from '../../../../components/shared/sidebar/sidebar.container';
import LOADER_TYPE from '../../../../loader.constant';
import RideAnalytics from './ride-analytics/ride-analytics.component';
import RideCard from './ride-cards/ride-card.component';
import './vehicle-rides.component.css';
import DownloadIcon from '@mui/icons-material/Download';
import { Icon, IconButton, Menu, Skeleton, Tooltip } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { enIN } from 'date-fns/locale';
import { getRequest, postRequest } from '../../../../api-service';
import API from '../../../../API_ENDPOINTS.constant';
import { SnackbarContext } from '../../../../App';
import { MapRenderTypes } from '../../../../components/shared/map/map.utility';
import PathLineMap from '../../../../components/shared/map/PathLineMap.component';
import Popup, { PopupProps } from '../../../../components/shared/popup/popup.component';
import TagsInput from '../../../../components/shared/tags-input/tags-input';
import TripsService from '../../../../services/trips.service';
import { getLocalStoreItem } from '../../../../utils';
import VehicleUtility from '../../../../utils/vehicle.utility';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
// @ts-ignore
import no_trips_img from '../../../../assets/images/trips/empty.png';
import { Trip, TripAnalyticsList } from './../../../../types';
import { VehiclePaths } from '../../../../AppPath.constants';

const VehicleRidesComponent = (props: any) => {
	const defaultTripReportFromDate = new Date(new Date(new Date().setDate(new Date().getDate() - 6)).setHours(0, 0, 0, 0));
	const defaultTripReportToDate = new Date();

	const { snackState, setSnackState } = useContext<any>(SnackbarContext);

	const [tripInFocus, setTripInFocus] = useState<string | null>(null);

	const vehicleID = useLocation().pathname.split('/').reverse()[0];

	const defaultFromDate = new Date(new Date(new Date().setDate(new Date().getDate())).setHours(0, 0, 0, 0));
	const defaultMinDate = new Date(new Date(new Date().setMonth(new Date().getMonth() - 1)).setHours(0, 0, 0, 0));
	const defaultToDate = new Date();

	const [ridePagination, setRidePagination] = useState({
		end_index: 0,
		start_index: 0,
		total_entries: 0
	})

	const loadMoreTrips = Boolean(ridePagination?.end_index < ridePagination?.total_entries);

	let currentPage = 0;
	if (ridePagination?.total_entries > 0) {
		currentPage = Math.max(Math.ceil(ridePagination?.end_index / ridePagination?.total_entries) - 1, 0);
	}

	const [trips, updateTrips] = useState<TripAnalyticsList>({});

	const [vehicle, updateVehicle] = useState(props?.location?.state || undefined);

	const [loader, updateLoader] = useState<boolean>(false);

	const [renderMap, setRenderMap] = useState<boolean>(false);

	const [showMapOverlay, setShowMapOverlay] = useState<boolean>(true);

	const [backlink, updateBacklink] = useState(`${VehiclePaths.ANALYTICS}/${VehicleUtility.readIMEI(vehicle)}`);

	useEffect(() => {
		if (!vehicle && backlink?.includes('undefined')) {
			updateBacklink(backlink.replace('undefined', props?.match?.params?.id));
		}

		if (vehicleID) {
			getRequest(API.VEHICLE_STATIC_DETAILS, { vehicle_id: vehicleID })
				.then(response => {
					const vehicleData = response?.data;
					if (vehicleData) {
						updateVehicle({ ...vehicle, v_reg_num: VehicleUtility.readRegistrationNumber(vehicleData) });
					}
				});
		}
	}, []);

	const [isDownloadTripReport, setDownloadTripReport] = useState<boolean>(false);
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const [emails, setEmails] = useState<Array<string>>();
	const [tripReportFromDate, setTripReportFromDate] = useState<Date>(new Date(defaultTripReportFromDate));
	const [tripReportToDate, setTripReportToDate] = useState<Date>(defaultTripReportToDate);

	const handlePopupClose = () => {
		setPopup({ ...popupProps });
		if (isDownloadTripReport) {
			resetDownloadTripReportDates();
			setDownloadTripReport(false);
		}
		setDownloadTripReport(false);
	}

	const popupProps: PopupProps = {
		open: false,
		onClose: handlePopupClose,
		title: '',
		content: '',
		styling: undefined,
		cancelButton: undefined
	}

	const [popup, setPopup] = useState<PopupProps>(popupProps);

	const [fromDate, setFromDate] = useState<Date>(new Date(defaultFromDate));
	const [toDate, setToDate] = useState<Date>(new Date(defaultToDate));
	const [liveTrip, setLiveTrip] = useState<Trip | undefined>(undefined);

	const resetDownloadTripReportDates = () => {
		setTripReportFromDate(defaultTripReportFromDate);
		setTripReportToDate(defaultTripReportToDate);
	}


	const toggleTripInFocus = (tripId: string | null, force = false): boolean => {
		if (force || liveTrip?.trip_id !== tripId) {
			setTripInFocus(tripId);
			return true;
		}
		return false;
	}

	const fetchLiveTrip = async (paramToDate: Date, queryPageNumber: number) => {
		const liveTripResponse = await TripsService.getLiveTrip(vehicleID, fromDate, paramToDate, queryPageNumber);
		if (liveTripResponse?.data) {
			setLiveTrip(liveTripResponse?.data?.data['live']);
		}
	}

	let paramToDate = new Date(new Date(toDate).setHours(23, 59, 59));
	const currentDate = new Date();
	if (paramToDate.getDate() === currentDate.getDate() && paramToDate.getMonth() === currentDate.getMonth() && paramToDate.getFullYear() === currentDate.getFullYear()) {
		paramToDate = new Date(paramToDate.setHours(currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds()));
	}

	const defaultTripRefreshRate = 10 * 1000;


	const loadTrips = (page_number?: number) => {
		updateLoader(true);

		let queryPageNumber = currentPage || 0;

		if (page_number) {
			queryPageNumber = page_number;
		}

		try {
			(async () => {
				if (vehicle) {
					const reg_num = VehicleUtility.readRegistrationNumber(vehicle);
					const tripsResponse = await TripsService.getTripList(vehicleID, fromDate, paramToDate, queryPageNumber, reg_num)
					if (tripsResponse?.data?.data?.all || tripsResponse?.data?.data?.today) {
						setRidePagination(tripsResponse.data?.pagination)

						const trips_data = [...tripsResponse.data.data.all, ...tripsResponse.data.data.today] as Trip[];
						let tripsDateList: TripAnalyticsList = TripsService.createDateObjectFromTripList(trips_data);
						tripsDateList = TripsService.mergeTripsList(fromDate, toDate, trips, tripsDateList);

						if (!tripsDateList.length && liveTrip) {
							toggleTripInFocus(liveTrip.trip_id, true);
						}
						updateTrips(TripsService.sortTripsList(tripsDateList));
					}
				}
			})().then(() => updateLoader(false));
		}
		catch (err) {
			updateLoader(false);
		}
	}

	// always load first page in case of filter reset.
	useEffect(() => { update_selected_wp_trip_id(null); loadTrips(0) }, [vehicle, fromDate, toDate]);

	// const csvParser = usePapaParse();
	const [waypoints, setWaypoints] = useState<Array<any> | undefined>(undefined);
	const [selected_wp_trip_id, update_selected_wp_trip_id] = useState<any>(null);

	const [showLiveTrip, setShowLiveTrip] = useState<boolean>(true);

	useEffect(() => {
		let liveTripInterval: any = undefined;
		fetchLiveTrip(paramToDate, 0);

		if (showLiveTrip) {
			liveTripInterval = setInterval(() => fetchLiveTrip(paramToDate, 0), defaultTripRefreshRate);
		} else {
			clearInterval(liveTripInterval);
		}

		return () => {
			clearInterval(liveTripInterval);
			setShowLiveTrip(false);
		}
	}, [vehicle]);

	useEffect(() => {
		if (selected_wp_trip_id === liveTrip?.trip_id) {
			update_selected_wp_trip_id(liveTrip?.trip_id);
			return
		}

		if (!renderMap) {
			setRenderMap(true);
			setShowLiveTrip(true);
		}

		if (!showMapOverlay && !renderMap) {
			setShowMapOverlay(true);
			update_selected_wp_trip_id(null);
			setShowLiveTrip(false);
		}
	}, [selected_wp_trip_id]);

	const getTripFromStateObject = (id: string): Trip | null => {
		let found_trip: Trip | null = null;
		if (liveTrip?.trip_id === id) return liveTrip;
		Object.keys(trips).forEach(date => {
			const current_trips = trips[date];
			const trip = current_trips.data.find((trip: any) => trip.trip_id === id);
			if (trip && Object.keys(trip).length > 0) {
				found_trip = trip;
			}
		})
		return found_trip;
	}

	useEffect(() => {
		const _trip = getTripFromStateObject(selected_wp_trip_id) as Trip;
		if (!_trip) {
			setShowMapOverlay(true);
			setRenderMap(false);
			setWaypoints([]);
			return
		}

		try {
			(async () => {
				if (_trip) {
					const result = await getRequest(API.RIDE_WAYPOINTS,
						{ 't_id': _trip?.trip_id, 'imei': _trip?.imei })
						.then(res => res?.data?.data);

					if (result) {
						parseWayPoints(result.map((datum: any) => ({ dt: datum[0], lat: datum[1], lon: datum[2] })));
					}
				}
			})();

		} catch (error) {
			handleCSVFailure(_trip)
		}

		setRenderMap(true);
		setShowMapOverlay(false);
	}, [selected_wp_trip_id]);

	const handleCSVFailure = (trip: any = undefined) => {
		if (!trip) {
			trip = getTripFromStateObject(selected_wp_trip_id);
		}
		setWaypoints(TripsService.generateWaypointsUsingRawTrip(trip));
	}

	// @ts-ignore
	const parseWayPoints = (result: any) => {
		try {
			if (result?.length) {
				const data = result.filter((dataPoint: { dt: string, lat: string, lon: string }) => dataPoint?.lat && dataPoint?.lon && dataPoint?.dt);
				setWaypoints(data);
			} else {
				handleCSVFailure()
			}
		} catch (error) {
			handleCSVFailure();
		}
	}

	const handleDropDownToggle = (keyDate: string) => {
		updateTrips((rides: any) => {
			rides[keyDate].toggleInfo = !rides[keyDate].toggleInfo;
			return { ...rides };
		});
	}

	const noTripsAvailable = !loader && !Object.keys(trips).length && !liveTrip;

	const renderSidebarContent = () => {
		return (
			<>
				{
					liveTrip && (
						<RideCard
							ride={liveTrip}
							vehicle={vehicle?.imei}
							getWayPoints={update_selected_wp_trip_id}
							tripInFocus={tripInFocus}
							toggleTripInFocus={toggleTripInFocus}
							show={true}
							reg_num={VehicleUtility.readRegistrationNumber(vehicle)}
						/>)
				}
				{
					// show trip list.
					trips && Object.entries(trips).length && !loader ?
						<>
							{
								Object.entries(trips).map(([date, date_rides]: [string, any], index: number) => {
									return (
										<div key={`trip-${index}`}>
											<div className='flex flex-between' style={{ padding: '1vh 0vw' }}>
												<span>{date}</span>
												<span className='flex'>
													{date_rides.data.length} Trip{date_rides.data.length > 1 ? 's' : ''}
													<Icon className='material-symbols-outlined' onClick={() => handleDropDownToggle(date)}>
														{
															date_rides.toggleInfo
																? 'expand_more'
																: 'expand_less'
														}
													</Icon>
												</span>
											</div>
											{
												date_rides?.data?.map((rides: Trip) => {
													return <RideCard
														key={rides?.trip_id}
														ride={rides}
														tripInFocus={tripInFocus}
														toggleTripInFocus={toggleTripInFocus}
														vehicleId={vehicle?.imei}
														getWayPoints={update_selected_wp_trip_id}
														show={!date_rides?.toggleInfo}
														reg_num={VehicleUtility.readRegistrationNumber(vehicle)}
													/>;
												})
											}
										</div>
									)
								})
							}
							{
								loadMoreTrips && <button className='load_more' onClick={() => loadTrips(currentPage + 1)}>Load more</button>
							}
						</>
						: ''
				}
				{
					// loading state.
					loader ? <Skeleton variant={'rectangular'} /> : ''
				}
				{
					// empty state
					noTripsAvailable ?
						(
							<>
								<div className='flex flex-center flex-justify-center flex-column empty-state'>
									<img height={180} width='auto' src={no_trips_img} alt="no trips found" />
									<div className='xs-font'>No Ended Trips for selected date range.</div>
								</div>
								<div className='flex flex-center info_msg'>
									<Icon className='material-symbols-outlined'>info</Icon> <span>Try again with different date range.</span>
								</div>
							</>
						) : ''
				}
			</>
		);
	}

	const mapOverlayComponent = () => vehicle && !loader && <RideAnalytics
		vehicleId={vehicleID}
		fromDate={fromDate}
		toDate={toDate}
		changeFromDate={setFromDate}
		changeToDate={setToDate}
		reg_num={VehicleUtility.readRegistrationNumber(vehicle)}
	/>;

	const handleMapOverlayAction = () => {
		if (renderMap) {
			setWaypoints([]);
			setRenderMap(false);
			update_selected_wp_trip_id(null);
			setShowLiveTrip(false);
		}
		if (!showMapOverlay) setShowMapOverlay(true);
		return mapOverlayComponent();
	}

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const handleEmails = (items: Array<string>) => setEmails(items);

	const open = Boolean(anchorEl);

	const renderMenu = () => {
		return (
			<div className="flex-horizontal-center cursor-pointer flex-center">
				<Tooltip
					title={
						<div>
							<div>- Only trips with 1 KM or more are visible</div>
							<div>- Routes/Energy Consumption/Trip Analytics is available for trips with 5km or more</div>
							<div>- Actual route for the live trips will be available soon</div>
						</div>
					}
				>
					<IconButton size="large">
						<InfoOutlinedIcon className='xs-font' />
					</IconButton>
				</Tooltip>
				<Icon
					aria-controls="basic-menu"
					aria-haspopup="true"
					aria-expanded={open ? 'true' : undefined}
					onClick={handleClick}
					className='material-symbols-outlined'
				>more_vert</Icon>
				<Menu
					anchorEl={anchorEl}
					open={open}
					onClose={handleClose}
				>
					{/* 
						(
							<MenuItem
								onClick={() => {
									setDownloadTripReport(true);
									handleClose()
								}}
								disableRipple >
								<Icon className='material-symbols-outlined'>article</Icon>Trip Report
							</MenuItem>
						)
						*/}
				</Menu>
			</div>
		);
	}

	const handleDownload = async () => {
		const vehicleRegNumber = VehicleUtility.readRegistrationNumber(vehicle);
		const imei = VehicleUtility.readIMEI(vehicle);

		let paramToDate = new Date(props?.dateRangePicker?.toDate);
		const currentDate = new Date();
		if (paramToDate.getDate() === currentDate.getDate() && paramToDate.getMonth() === currentDate.getMonth() && paramToDate.getFullYear() === currentDate.getFullYear()) {
			paramToDate = new Date(paramToDate.setHours(currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds()));
		}

		const response: any = await postRequest(
			API.TRIP_REPORT,
			{
				_from: btoa(tripReportFromDate.toISOString()),
				_to: btoa(tripReportToDate.toISOString()),
				emails: btoa(`[${emails}]`),
				registration_number_list: btoa(`[${vehicleRegNumber}]`),
				imei_list: btoa(`[${imei}]`)
			}
		).catch((event: any) => {
			setSnackState({
				...snackState,
				message: response?.data?.error,
				open: true,
				severity: 'error',
				onClose: () => setSnackState({ ...snackState, open: false })
			});
		});

		setAnchorEl(null);
		handlePopupClose();

		if (response?.status) {
			setSnackState({
				...snackState,
				message: response?.data?.message,
				open: true,
				severity: 'success',
				onClose: () => setSnackState({ ...snackState, open: false })
			});
		}
	}

	// It will set default email for fetching Reports
	useEffect(() => {
		const email = JSON.parse(getLocalStoreItem('user') as string)?.email;
		handleEmails(email ? [email] : []);
	}, []);

	useEffect(() => {
		if (isDownloadTripReport) {
			setPopup({
				...popupProps,
				open: isDownloadTripReport,
				title: 'Download Trip Report'
			});
		}
	}, [isDownloadTripReport])



	const renderPopupContent = () => {
		return (
			<>
				{
					isDownloadTripReport
					&& (
						<>
							<div className={'flex flex-column-vert-center'}>
								<div className={'flex flex-center-gap'}>

									<LocalizationProvider adapterLocale={enIN} dateAdapter={AdapterDateFns}>
										<DatePicker
											label="From Date"
											value={tripReportFromDate}
											maxDate={new Date()}
											onChange={(newValue: Date) => setTripReportFromDate(newValue)}
											slotProps={{ textField: { variant: 'outlined' } }}
										/>

										<DatePicker
											label="To Date"
											value={tripReportToDate}
											onChange={(newValue: Date) => setTripReportToDate(newValue)}
											slotProps={{ textField: { variant: 'outlined' } }}
											minDate={tripReportFromDate}
											maxDate={new Date()}
										/>
									</LocalizationProvider>
								</div>
								<h3 />
								<div className={'flex flex-center-gap'}>
									<TagsInput
										defaultValue={emails}
										selectedTags={handleEmails}
										fullWidth
										variant="outlined"
										id="tags"
										name="emails"
										placeholder="Add Email/s"
										label="Email/s"
									/>
								</div>
								<div className={'active-text'}>Press enter to add email/s</div>
								<div className={'flex flex-center-gap report-download-button-container flex-center'}>
									<button className={'cancel-btn'} onClick={handlePopupClose}>Cancel</button>
									<button
										disabled={!emails?.length}
										className={'apply-btn flex flex-center-gap'}
										onClick={() => handleDownload()}
									>
										<DownloadIcon /> Download
									</button>
								</div>
							</div>
						</>
					)
				}
			</>
		);
	}

	const getTripMeta = () => {
		let tripMeta = Object.values(trips)?.flatMap(trip => trip?.data)?.find((trip: Trip) => trip.trip_id === tripInFocus);

		if (liveTrip?.trip_id === tripInFocus) {
			tripMeta = liveTrip;
		}

		return tripMeta;
	}

	return (
		<div className={'ev-sidebar-map-container'}>
			<Sidebar
				title={{ show: true, text: VehicleUtility.readRegistrationNumber(vehicle) }}
				backlink={backlink}
				content={renderSidebarContent()}
				menu={{ component: renderMenu() }}
			/>
			{
				popup?.open
				&& (
					<Popup
						open={popup?.open}
						title={popup?.title}
						onClose={popup?.onClose}
						content={renderPopupContent()}
						cancelButton={popup?.cancelButton}
					/>
				)
			}
			{
				loader && !vehicle
					? <Loader type={LOADER_TYPE.FULL_PAGE} />
					: (
						<PathLineMap {...{
							markers: waypoints,
							type: MapRenderTypes.PATH,
							markerMeta: getTripMeta(),
							renderMap,
							dateRangePicker: {
								minDate: defaultMinDate,
								fromDate: fromDate,
								toDate: toDate,
								changeFromDateAction: setFromDate,
								changeToDateAction: setToDate,
							},
							overlay: {
								show: showMapOverlay,
								action: handleMapOverlayAction
							},
						}} />
					)
			}
		</div>
	);
}

export default VehicleRidesComponent;
