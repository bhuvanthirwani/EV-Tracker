import React, {
	memo,
	useEffect,
	useState
} from 'react';
import {getFormattedAddress} from '../../../../utils/shared.api';
import {Link} from 'react-router-dom';
import Battery from '../../../../components/shared/battery/battery.component';
// @ts-ignore
import MapPointer from '../../../../assets/images/map-pointer.svg';
import {
	Icon,
	Skeleton
} from '@mui/material';
import AppPath, { VehiclePaths } from '../../../../AppPath.constants';
import {getConfig} from '../../../../firebase.service';
import VehicleUtility from '../../../../utils/vehicle.utility';

const ROUTE_STATUS_CONFIG = getConfig('route_status');
const VEHICLE_STATUS_CONFIG = getConfig('vehicle_status');

export const formattedAddress: any = {};

const VehicleCard = (props: any) => {
	const {vehicle} = props;

	const batteryStatus = vehicle?.status?.battery;
	const vehicleStatus = vehicle?.status?.vehicle;
	const routeStatus = vehicle?.status?.route;
	const soc = vehicle?.battery?.soc;
	const imei = VehicleUtility.readIMEI(vehicle);
	const vehicleLocation = vehicle?.location?.coordinate;
	const range = vehicle?.distance?.range;

	const coordUpto4Decimals = {
		latitude: vehicleLocation?.latitude?.toFixed(4),
		longitude: vehicleLocation?.longitude?.toFixed(4)
	};

	const [addressInfo, setAddressInfo] = useState<any>({ addressRequested: false, address: null });

	useEffect(() => {
		(async () => {
			if (vehicleLocation && addressInfo?.addressRequested) {
				const address = await getFormattedAddress(coordUpto4Decimals);
				if (address) {
					formattedAddress[imei] = address
					setAddressInfo({ ...addressInfo, address: address });
				}
				return address;
			}
		})();
	}, [addressInfo?.addressRequested, JSON.stringify(coordUpto4Decimals)]);

	return (
		<div className={'vehicle-card-container'} key={parseInt(imei)}>
			<Link to={{pathname: `${VehiclePaths.ANALYTICS}/${imei}`, state: {...vehicle}}}>
				<div className={'vehicle-card border'}>
					<div className="vehicle-card-header">
						<div className={'flex flex-center-gap'}>
							<div className="vehicle-card-line"
								style={{backgroundColor: VEHICLE_STATUS_CONFIG?.[vehicleStatus]}}/>
							<div className={'vehicle-number'}>
								{VehicleUtility.readRegistrationNumber(vehicle) || <Skeleton variant={'text'} width={200}/>}
								<span className="parking">{ROUTE_STATUS_CONFIG?.[routeStatus]}</span>
							</div>
						</div>

						<div className="battery-perc xs-font">
							<div className="battery">
								<Battery
									batteryPercentage={soc}
									batteryStatus={batteryStatus}
								/>
								<span>{soc && soc.toString().split('.')[0]}% </span>
							</div>
							<div> |</div>
							<div><span className='grey-text'>Range:</span> {range || '--'}km</div>
						</div>
					</div>
					<div
						className='location-name'
						title={addressInfo?.address}
					>
						{
							addressInfo?.addressRequested
							? <>
								<img className={'address-marker'} src={MapPointer} alt={'map-pointer'}/>
								<span className={'text-overflow-ellipsis'} style={{width: '100%'}}>
									{addressInfo?.address || <Skeleton variant={'text'}/>}
								</span>
							</>
							: <span
								title='Click to see Address'
								onClick={(event: any) => {
									event?.stopPropagation();
									event?.preventDefault();
									setAddressInfo({ ...addressInfo, addressRequested: true });
								}}
								className='view-address'
							>
								View address
							</span>
						}
					</div>
				</div>
			</Link>
			{
				soc <= 20
				&& (
					<Link to={{pathname: `${AppPath.CHARGING_STATION}`, state: {vehicle: vehicle}}}>
						<span className="card-alert">
							<Icon className='material-symbols-outlined'>error_outline</Icon>
							Find Charging hubs
						</span>
					</Link>
				)
			}
		</div>
	);
};

export default memo(VehicleCard);
