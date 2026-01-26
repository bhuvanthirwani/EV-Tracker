import {
	Divider,
	Icon,
} from '@mui/material';
import { AxiosResponse } from 'axios';
import React, {
	useContext,
	useEffect,
	useState
} from 'react';
import {
	Link,
	useLocation,
	useHistory
} from 'react-router-dom';

import API from '../../../../API_ENDPOINTS.constant';
import AppPath from '../../../../AppPath.constants';
import { getRequest } from '../../../../api-service';
import Map from '../../../../components/shared/map/map.container';
import Popup, { PopupProps } from '../../../../components/shared/popup/popup.component';
import { getConfig } from '../../../../firebase.service';
import { formatDateWithYearAndTime, formatTimeWithDHM } from '../../../../utils/date.utils';
import './../vehicle-analytics/vehicle-analytics.component.css';
import './../../components/live-update-sharing/live-update-sharing.component.css';
import { SnackbarContext } from '../../../../App';
import Battery from '../../../../components/shared/battery/battery.component';
import { MapRenderTypes } from '../../../../components/shared/map/map.utility';
import VehicleUtility from '../../../../utils/vehicle.utility';
import VEHICLE from '../../vehicle.interface';
//@ts-ignore
import logo from './../../../../assets/images/ev-tracker-logo-full.png';
import './../../../../stylesheet.css'
import ScheduleSharpIcon from '@mui/icons-material/ScheduleSharp';
import NavigationSharpIcon from '@mui/icons-material/NavigationSharp';
//@ts-ignore
import promoImg from './../../../../assets/images/promoCard.png'
import ArrowRightAltSharpIcon from '@mui/icons-material/ArrowRightAltSharp';

const ShareVehicle = (props: any) => {
	const { snackState, setSnackState } = useContext<any>(SnackbarContext);

	const BatteryStatusMap = getConfig('battery_status');
	const history = useHistory();

	const [vehicle, updateVehicle] = useState<VEHICLE | null>(null);
	const params = useLocation().search;
	const vehicleId = new URLSearchParams(params).get('id') || location.pathname.split('/').reverse()[0];

	useEffect(() => {
		getVehicleUpdate(vehicleId);

		const interval = setInterval(() => {
			getVehicleUpdate(vehicleId);
		}, 5 * 1000);
		return () => clearInterval(interval);
	}, [vehicleId]);

	const getVehicleUpdate = (imei: string) => {
		if (imei) {
			return getRequest(API.LIVE_UPDATE, { imei })
				.then((response: AxiosResponse) => {
					if (response?.data && response?.data?.success) {
						updateVehicle(response.data?.data);
					} else if (response?.data && response?.data?.code === 204) {
						history.replace(AppPath.EXPIRED_PAGE);
					}
				});
		}
		return;
	}

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

		if (isShareLocation) {
			setShareLocation(false);
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

	const renderBattery = () => {

		const getBatteryIndex = () => {
			// @ts-ignore
			return parseInt(Object.entries(BatteryStatusMap).find(([key, value]) => vehicle?.status?.battery === value)?.[0])
		}

		return (
			<>
				<div className='flex flex-justify-between battery-card-text white standard-padding border fill-width box-shadow' title={BatteryStatusMap?.[getBatteryIndex()]}>
					<div className=''>Battery</div>
					<div className='flex flex-center-gap'>
						<div className="battery flex">
							<Battery
								batteryPercentage={vehicle?.battery?.soc}
								batteryStatus={getBatteryIndex()}
							/>
						</div>
						<div>{vehicle?.battery?.soc && vehicle?.battery?.soc.toString().split('.')[0]}% </div>
					</div>
				</div>

				{renderRangeLeft()}
				{renderTTFC()}
			</>
		);
	}


	const renderTimer = () => {
		return (
			vehicle?.status && (
				<div className='flex flex-center flex-justify-between standard-padding sub-heading-text' style={{ width: 'inherit' }}>
					<div className='grey-font'>Last updated at</div>
					<div className={`flex-center strong-font standard-padding time ${vehicle?.status?.location ? '' : 'warning'}`} title={'last updated vehicle location'}>
						<ScheduleSharpIcon sx={{ color: "#202124", fontSize: '20px' }} />
						<span>{vehicle?.lua?.location && formatDateWithYearAndTime(vehicle?.lua?.location)}</span>
					</div>
				</div>
			)
		);
	}

	const renderPopupContent = () => {
		const vehicleRegNumber = VehicleUtility.readRegistrationNumber(vehicle as VEHICLE);
		return (
			<>
				{
					isShareLocation
					&& (<>
						<Link
							target={'_blank'}
							rel={'noopener noreferrer'}
							to={{ pathname: locationURI }}
							className={'flex flex-center-gap'}
						>
							<Icon className='material-symbols-outlined'>open_in_new</Icon>
							{vehicleRegNumber} location
						</Link>
						<Icon
							className={'cursor-pointer material-symbols-outlined'}
							onClick={copyLocation}
						>content_copy</Icon>
					</>
					)
				}
			</>
		);
	}

	const locationShare = () => {
		return (
			<div className='flex flex-column flex-center-gap white standard-padding border fill-width box-shadow location-card'>
				<div className='flex flex-justify-between flex-center fill-width'>
					<div>Location</div>

					<Link
						target={'_blank'}
						rel={'noopener noreferrer'}
						to={{ pathname: `https://www.google.com/maps/dir//${vehicle?.location?.coordinate?.latitude}%2C${vehicle?.location?.coordinate?.longitude}` }}
						className={'flex flex-center-gap navigate-button'}
					>
						<NavigationSharpIcon sx={{ rotate: '45deg', fontSize: '16px' }} />
						<span>Navigate</span>
					</Link>
				</div>

				<div className='flex flex-start-gap fill-width'>
					{vehicle?.location?.address}
				</div>
			</div>
		)
	}

	const promotionCard = () => {
		return (
			<div className='flex standard-padding border flex-center marketing-card fill-width box-shadow'>
				<div className='flex flex-column flex-justify-end gap-5' style={{ width: '40%' }}>
					<div>Make your fleet bigger</div>
					<div className='flex flex-center'>
						<span>Explore now</span>
						<ArrowRightAltSharpIcon sx={{ fontSize: '14px' }} />
					</div>
				</div>
			</div>
		)
	}


	return (
		<div className='flex flex-column' style={{ width: '100%' }}>
			<div className='banner standard-padding'>
				<div className='white-font banner-text'>{VehicleUtility.readRegistrationNumber(vehicle)}</div>

				<div>
					<img alt='Tesla Logo' src={logo} className='standard-padding' />
				</div>
			</div>

			<div className='flex flex-center white' style={{ position: 'relative', top: '1px', width: '100%', zIndex: 100 }}>
				{renderTimer()}
			</div>

			{
				vehicle
				&& (
					<Map
						{
						...{
							markers: [vehicle],
							type: MapRenderTypes.LIVE_SPEED,
							renderMap: vehicle,
							telemetryStatus: vehicle.status?.telemetry
						}
						}
					/>
				)
			}

			<div className='flex flex-center-gap'>
				{
					vehicle?.status && !vehicle?.status?.telemetry ?
						<div className='sm-font standard-ui-warning standard-padding emphasis-border warning'>
							<Icon>error</Icon>
							<span>Vehicle is Unreachable! Please contact support</span>
						</div> : ''
				}
			</div>

			<div className='flex flex-column flex-center-gap card-section'>
				{promotionCard()}
				{renderBattery()}
				{locationShare()}
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
		</div>
	);
}

export default ShareVehicle;
