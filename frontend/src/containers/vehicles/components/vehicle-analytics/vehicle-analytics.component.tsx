import {
	Divider,
	Icon,
	Menu,
	MenuItem,
	Skeleton,
	Tooltip
} from '@mui/material';
import { AxiosResponse } from 'axios';
import React, {
	useEffect,
	useRef,
	useState,
	useContext
} from 'react';
import {
	Link,
	useLocation
} from 'react-router-dom';

import API from '../../../../API_ENDPOINTS.constant';
import AppPath, { VehiclePaths } from '../../../../AppPath.constants';
import { getRequest } from '../../../../api-service';
import DrawerComponent, { DrawerProps } from '../../../../components/shared/drawer/drawer.component';
import Map from '../../../../components/shared/map/map.container';
import Popup, { PopupProps } from '../../../../components/shared/popup/popup.component';
import { getConfig } from '../../../../firebase.service';
import { formatDateWithYearAndTime, formatTimeWithDHM } from '../../../../utils/date.utils';
import { getFormattedAddress } from '../../../../utils/shared.api';
import './vehicle-analytics.component.css';
// @ts-ignore
import vehicle_img from '../../../../assets/images/tesla-vehicle-side.png'; import BatteryAnalyticsImage from '../../../../assets/images/analytics-graph.svg';
import Battery, { BatterySize } from '../../../../components/shared/battery/battery.component';
import { defaultTileStyleNavigation, MapRenderTypes } from '../../../../components/shared/map/map.utility';
import Sidebar from '../../../../components/shared/sidebar/sidebar.container';
import { getLocalStoreItem } from '../../../../utils';
import VehicleUtility from '../../../../utils/vehicle.utility';
import VEHICLE from '../../vehicle.interface';
import DigitalLock from './vehicle-actions/digital-lock/lock.component';
import { VehicleActions } from './vehicle-analytics.constants';
import { SnackbarContext } from '../../../../App';

const VehicleAnalyticsComponent = (props: any) => {
	const { snackState, setSnackState } = useContext<any>(SnackbarContext);

	const user = JSON.parse(getLocalStoreItem('user') as string);

	const BatteryStatusMap = getConfig('battery_status');

	const params = useLocation();
	const initVehicle: any = params.state || null;
	const vehicleId = new URLSearchParams(params.pathname).get('id') || location.pathname.split('/').reverse()[0];

	const [vehicle, updateVehicle] = useState<VEHICLE | null>(initVehicle);

	useEffect(() => {
		if (!initVehicle) {
			getVehicleUpdate(vehicleId);
		}

		const interval = setInterval(() => {
			getVehicleUpdate(vehicleId);
		}, 5 * 1000);
		return () => clearInterval(interval);
	}, [vehicleId]);

	const getVehicleUpdate = (imei: string) => {
		if (imei) {
			return getRequest(API.V4_GET_VEHICLE_UPDATE, { imei }).then((response: AxiosResponse) => {
				if (response?.data && response?.data?.success) updateVehicle(response.data?.data);
			});
		}
		return;
	}

	const [formattedAddress, updateFormattedAddress] = useState();
	useEffect(() => {
		if (vehicle?.location?.coordinate) {
			getFormattedAddress(vehicle.location.coordinate)
				.then((address) => {
					if (address) {
						updateFormattedAddress(address)
					}
				});
		}
	}, [vehicle?.location?.coordinate?.latitude, vehicle?.location?.coordinate?.longitude]);

	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};

	const [isShareLocation, setShareLocation] = useState<boolean>(false);

	const popupProps: PopupProps = {
		open: false,
		onClose: () => handlePopupClose(),
		title: '',
		content: '',
		styling: undefined,
		cancelButton: undefined
	};

	const [popup, setPopup] = useState<PopupProps>(popupProps);

	const handlePopupClose = () => {
		setPopup({ ...popupProps });

		switch (true) {
			case isShareLocation:
				setShareLocation(false);
				break;
		}
	};


	const [locationURI, setLocationURI] = useState<string>('');
	const shareLocation = (value?: boolean) => {
		if (value) {
			const location = `https://www.google.com/maps/search/?api=1&query=${vehicle?.location?.coordinate?.latitude}%2C${vehicle?.location?.coordinate?.longitude}`;
			setLocationURI(location);
			return location;
		}
		setShareLocation(false);
		handlePopupClose();
		return;
	}

	const copyLocation = () => {
		navigator.clipboard
			.writeText(locationURI)
			.then(() => {
				setShareLocation(false);
				handlePopupClose();
				setSnackState({
					...snackState,
					open: true,
					message: 'Copied to Clipboard!',
					severity: 'success'
				});
			});
	}


	useEffect(() => {
		if (isShareLocation) {
			setPopup({
				...popupProps,
				open: isShareLocation,
				title: 'Share Vehicle Location',
				onClose: shareLocation,
			})
		}
	}, [isShareLocation]);


	const handleDrawerClose = () => {
		setRangeLeftDrawer(rangeLeftDrawerConfig);
	}

	const rangeLeftDrawerConfig: DrawerProps = {
		open: false,
		onClose: handleDrawerClose,
		content: ''
	};

	const [rangeLeftDrawer, setRangeLeftDrawer] = useState<DrawerProps>(rangeLeftDrawerConfig);

	const renderTTFC = () => {
		if (vehicle?.battery?.ttfc) {
			return (
				<>
					<Divider style={{ borderColor: 'var(--primary-accent-color)' }} />
					<div className='flex flex-justify-between flex-center width-100'>
						<div className='flex flex-center-gap'>
							<Icon className='white-font material-symbols-outlined'>battery_charging_full</Icon>
							<div className='flex flex-column'>
								<div className='sm-font white-font'>{formatTimeWithDHM(vehicle?.battery?.ttfc) || '--'}</div>
								<div className='xs-font grey-text'>Time to Full Charge</div>
							</div>
						</div>
						<Link className='sm-font active-text flex flex-center' to={{ pathname: AppPath.CHARGING_STATION, state: { vehicle } }}>
							Find Chargers <Icon className='active-text material-symbols-outlined'>chevron_right</Icon>
						</Link>
					</div>
				</>
			);
		} else {
			return '';
		}
	};

	const renderRangeLeft = () => {
		if (vehicle?.distance?.range) {
			return (
				<div className='flex flex-center flex-column'>
					<div className='white-font'>{vehicle?.distance?.range || '--'} km</div>
					<div className='xs-font grey-text'>Range Left</div>
				</div>
			);
		} else {
			return '';
		}
	};

	const renderBattery = (type?: string | boolean) => {

		const getBatteryIndex = () => {
			// @ts-ignore
			return parseInt(Object.entries(BatteryStatusMap).find(([key, value]) => vehicle?.status?.battery === value)?.[0])
		}

		return (
			<div className="battery-header flex flex-column">
				{
					type && (
						<>
							<label className="battery-label drawer-range-left flex flex-between flex-center-gap">
								{/* <span>{vehicle?.prediction?.range?.current || 0}KM</span> */}
								<img src={BatteryAnalyticsImage} alt="battery_analytics" className="battery_graph" />
							</label>
						</>
					)
				}

				<div className={'flex flex-center flex-justify-between width-100'}>
					<Battery
						batteryPercentage={vehicle?.battery?.soc}
						batteryStatus={getBatteryIndex()}
						variant={BatterySize.L}
					/>
					<div className='flex flex-center flex-center-gap dark-bg-on-dark emphasis-border standard-padding-small'>
						<Icon className='active-text material-symbols-outlined'>energy_savings_leaf</Icon>
						<span className='white-font xs-font'>{vehicle?.status?.vehicle_mode || 'economy'} mode</span>
					</div>
				</div>
				<div className='flex flex-justify-between flex-center width-100'>
					<div className='flex flex-center flex-column'>
						<div className='white-font'>{vehicle?.battery?.soc || 0}%</div>
						<div className='xs-font grey-text'>Battery SoC</div>
					</div>
					{renderRangeLeft()}
					<div className=" flex flex-center flex-column">
						<div className='white-font'>{vehicle?.temperature?.battery || '--'} °C</div>
						<div className='xs-font grey-text'>Temperature</div>
					</div>
				</div>
				{renderTTFC()}
			</div>
		);
	}

	const digitalLockRef = useRef<any>();
	const handleLockAction = (action: string) => {
		const popupContent = <DigitalLock ref={digitalLockRef} {...{ popupCallback: handlePopupClose, vehicle, action }} />;

		setPopup({
			...popupProps,
			content: popupContent,
			open: true,
			title: `Confirm Vehicle ${action}`,
			applyButton: {
				text: 'Confirm',
				action: () => digitalLockRef?.current?.action(),
				disabled: digitalLockRef?.current?.isConfirmed || true
			},
			cancelButton: {
				text: 'NO',
				action: handlePopupClose
			}
		})
	}

	useEffect(() => {
		setPopup({ ...popup, applyButton: { ...popup.applyButton, disabled: !digitalLockRef?.current?.isConfirmed } })
	}, [digitalLockRef?.current?.isConfirmed])


	const renderLockState = (locState: string | number | null | undefined) => {
		const isLocked = locState && locState == 1 ? true : false;

		if (user && user['acts']) {
			if (isLocked) {
				return (
					<div onClick={() => handleLockAction(VehicleActions.UNLOCK)} className='flex flex-center flex-center-gap border standard-padding white cursor-pointer'>
						<Icon className='lg-font material-symbols-outlined error-text'>lock</Icon>
						<div className='flex flex-column'>
							<div className='sm-font primary-font'>Locked</div>
							<div className='xs-font grey-text'>Click to Unlock</div>
						</div>
					</div>
				);
			} else {
				return (
					<div onClick={() => handleLockAction(VehicleActions.LOCK)} className='flex flex-center flex-center-gap border standard-padding white cursor-pointer' style={{ border: 'none' }}>
						<Icon className='lg-font material-symbols-outlined primary-font'>lock_open_right</Icon>
						<div className='flex flex-column'>
							<div className='sm-font primary-font'>Unlocked</div>
							<div className='xs-font grey-text'>Click to Lock</div>
						</div>
					</div>
				);
			}
		} else {
			return (
				<div className='flex flex-center flex-center-gap border standard-padding white cursor-pointer' style={{ border: 'none' }}>
					<Icon className='lg-font material-symbols-outlined'>lock</Icon>
					<div className='flex flex-column'>
						<div className='sm-font'>Lock Vehicle</div>
						<div className='xs-font active-text'>Coming Soon</div>
					</div>
				</div>
			);
		}
	}

	const renderSidebarContent = () => {
		return (
			<div className='vehicle_analytics_layout'>
				<div>
					<div className='flex flex-justify-between flex-center-gap grey-background standard-padding sidebar-banner-area'>
						<img src={vehicle_img} alt="vehicle" style={{ width: '200px', height: '200px', borderRadius: '5px' }} />
						{
							renderLockState(vehicle?.status?.mob_status)
						}
					</div>
					<div style={{ display: 'none' }} className='flex flex-between flex-center-gap'>
						<div className='flex flex-center flex-center-gap border standard-padding'>
							<Icon className='lg-font material-symbols-outlined'>share</Icon>
							<div className='flex flex-column'>
								<div className='sm-font'>Share Location</div>
								<div className='xs-font'>Click to copy</div>
							</div>
						</div>
					</div>

					<div className="flex flex-justify-between">
						<span className='sidebar-title'>Vehicle Info</span>
						{
							vehicle?.status
							&& (
								<div className={`flex-horizontal-center time ${vehicle?.status?.telemetry ? '' : 'warning'}`}>
									<Icon className='material-symbols-outlined'>schedule</Icon>
									<Tooltip title={'last updated vehicle data'}>
										<span>
											{
												vehicle?.lua?.vehicle
												&& formatDateWithYearAndTime(vehicle?.lua?.vehicle)
											}
										</span>
									</Tooltip>
								</div>
							)
						}
					</div>
					{
						vehicle?.status && !vehicle?.status?.telemetry ?
							<div className='sm-font standard-ui-warning standard-padding emphasis-border warning'>
								<Icon>error</Icon>
								<span>Vehicle is Unreachable! Please contact support</span>
							</div> : ''
					}
					{renderBattery()}
					<div className='grid grid-3-col'>
						<div className="flex flex-column border standard-padding standard-row-gap">
							<Icon className='material-symbols-outlined'>airline_stops</Icon>
							<div>
								<div>
									<span className="strong-font">{vehicle?.distance?.live || 0}</span>
									<span> km</span>
								</div>
								<div className="xs-font grey-text">Ongoing Trip</div>
							</div>
						</div>
						<div className="flex flex-column border standard-padding standard-row-gap">
							<Icon className='material-symbols-outlined'>local_shipping</Icon>
							<div>
								<div>
									<span className="strong-font">{vehicle?.distance?.today || 0}</span>
									<span> km</span>
								</div>
								<div className="xs-font grey-text">Travelled Today</div>
							</div>
						</div>
						<div className="flex flex-column border standard-padding standard-row-gap">
							<Icon className='material-symbols-outlined'>speed</Icon>
							<div>
								<div>
									<span className="strong-font">{vehicle?.distance?.odo || 0}</span>
									<span> km</span>
								</div>
								<div className="xs-font grey-text">Odometer</div>
							</div>
						</div>
					</div>

					<Link
						to={{ pathname: AppPath.USER + AppPath.USER_VEHICLES_LIST, state: { vehicle_number: vehicle?.vehicle_meta?.registration_number } }}
						className="flex flex-center flex-justify-between border standard-padding standard-row-gap primary-font"
					>
						<div className='flex flex-center flex-center-gap'>
							<Icon className='material-symbols-outlined'>description</Icon>
							<div className='strong-font'>
								Other Info
							</div>
						</div>
						<Icon className='material-symbols-outlined'>open_in_new</Icon>
					</Link>
				</div>
				<Link className='flex flex-center' to={{ pathname: `${VehiclePaths.RIDES}/${VehicleUtility.readIMEI(vehicle as VEHICLE)}`, state: vehicle }}>
					<button className='trips_button standard-padding border'>
						View Trip History
					</button>
				</Link>
			</div>
		);
	}

	const renderMenu = () => {
		return (
			<div className="flex-horizontal-center cursor-pointer">
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
					<MenuItem
						onClick={() => {
							setShareLocation(true);
							shareLocation(true);
							handleClose();
						}}
						selected={false}
					>
						<Icon className='material-symbols-outlined'>share</Icon>
						Share Location
					</MenuItem>
				</Menu>
			</div>
		);
	}

	const renderTimer = () => {
		return (
			vehicle?.status && (
				<div className={`flex-horizontal-center time ${vehicle?.status?.location ? '' : 'warning'}`}>
					<Icon className='material-symbols-outlined'>schedule</Icon>
					<Tooltip title={'last updated vehicle location'}>
						<span>
							{
								vehicle?.lua?.location
								&& formatDateWithYearAndTime(vehicle?.lua?.location)
							}
						</span>
					</Tooltip>
				</div>
			)
		);
	}

	const renderSubHeader = () => {
		return (<div className="location formatted-address">{formattedAddress || <Skeleton style={{ width: '100%' }} variant={'text'} />}</div>);
	}

	const getReportAction = () => {
		return (
			<Link to={'/vehicles/dashboard'} />
		);
	}

	const renderPopupContent = () => {
		const vehicleRegNumber = VehicleUtility.readRegistrationNumber(vehicle as VEHICLE);
		return (
			<>
				{
					isShareLocation
					&& (<>
						<Tooltip title='Open in Google Maps'>
							<Link
								target={'_blank'}
								rel={'noopener noreferrer'}
								to={{ pathname: locationURI }}
								className={'flex flex-center-gap'}
							>
								<Icon className='material-symbols-outlined'>open_in_new</Icon>
								{vehicleRegNumber} location
							</Link>
						</Tooltip>
						<Tooltip title='Copy Location'>
							<Icon
								className={'cursor-pointer material-symbols-outlined'}
								onClick={copyLocation}
							>content_copy</Icon>
						</Tooltip>
					</>
					)
				}
			</>
		);
	}

	const generateStatusList = () => {
		if (vehicle?.status) {
			switch (vehicle?.status?.sleep_mode) {
				case 1:
					return (<Tooltip title='Dongle is in sleep mode'><div className='flex-horizontal-center'><Icon className='material-symbols-outlined'>mode_night</Icon></div></Tooltip>);
				default:
					return '';
			}
		} else {
			return '';
		}
	}

	return (
		<div className={'ev-sidebar-map-container'}>
			<Sidebar
				backlink={AppPath.VEHICLES}
				title={{ show: true, text: VehicleUtility.readRegistrationNumber(vehicle as VEHICLE) }}
				statusList={generateStatusList()}
				timer={{ component: renderTimer() }}
				menu={{ component: renderMenu() }}
				subHeader={{ component: renderSubHeader() }}
				content={renderSidebarContent()}
				button={{ show: false, action: () => getReportAction(), text: 'Get Report' }}
			/>
			<div>
				{
					vehicle
					&& (
						<Map
							{
							...{
								markers: [vehicle],
								type: MapRenderTypes.LIVE_SPEED,
								renderMap: vehicle,
								telemetryStatus: vehicle.status?.telemetry,
								tile: defaultTileStyleNavigation
							}
							} />
					)
				}
			</div>

			{
				popup
				&& popup.open
				&& (
					<Popup
						open={popup?.open}
						title={popup?.title}
						onClose={popup?.onClose}
						content={popup?.content || renderPopupContent()}
						applyButton={popup?.applyButton}
						cancelButton={popup?.cancelButton}
					/>
				)
			}

			{
				rangeLeftDrawer?.open && (<DrawerComponent {...rangeLeftDrawer} />)
			}
		</div>
	);
}

export default VehicleAnalyticsComponent;
