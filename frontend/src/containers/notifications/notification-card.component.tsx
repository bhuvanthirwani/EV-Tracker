import React, {memo} from 'react';
import {Link} from 'react-router-dom';
import moment from 'moment';
import {Icon} from '@mui/material';

import AppPath, { VehiclePaths } from '../../AppPath.constants';

const NotificationTypeTextMap: any = {
	'battery_soc': {
		title: 'Battery SOC',
		icon: 'bolt',
		cta: 'Find Charging Station'
	},
	'speed': {
		title: 'Over Speeding',
		icon: 'speed',
	},
	'aux_battery_voltage': {
		title: 'Aux Battery Voltage',
		icon: 'bolt'
	}
}

const calculateTimeFromNow = (date: Date): string => {
	const currentTime = new Date();
	let timeString;
	let diff = moment(currentTime).diff(moment(date), 'hours');
	timeString = diff + 'h';

	if (diff <= 0) {
		diff = moment(currentTime).diff(moment(date), 'minutes');
		timeString = diff + 'm';
	}

	if (diff <= 0) {
		diff = moment(currentTime).diff(moment(date), 'seconds');
		timeString = diff + 's';
	}

	return timeString + ' ago';
};

const NotificationCard = memo((props: any) => {
	// @ts-ignore
	const {notification, vehicle} = props;

	const type = notification?.title?.split(' ')[0];

	return (
		<div className={'notifications-cards-container'}>
			<div className={'notifications-card'}>
				<Icon className={'notifications-icon material-symbols-outlined'}>{NotificationTypeTextMap?.[type]?.icon}</Icon>

				<div className={'notifications-card-info'}>
					<div className={'notifications-card-header flex flex-center flex-between'}>
						<div className={'notifications-card-title'}>
							{notification?.title.split('_')?.join(' ').toUpperCase()}
						</div>
						<div className={'notifications-card-registration-number'}>
							<Link to={{ pathname: `${VehiclePaths.ANALYTICS}/${vehicle?.imei}`, state: {...vehicle} }}>{notification?.registration_number}</Link>
						</div>
					</div>
					<div className={'flex flex-center-gap flex-between notifications-card-body'}>
						{notification?.body.split('_').join(' ')}
					</div>

					<div className={'flex flex-center-gap flex-between'}>
						<div className={'notifications-card-cta'}>
							{
								NotificationTypeTextMap?.[type]?.cta
								&& <Link
									className={'flex flex-center'}
									to={{pathname: `${AppPath.CHARGING_STATION}/book`, state: {vehicle: vehicle}}}
								>
									{NotificationTypeTextMap?.[type]?.cta} <Icon className='material-symbols-outlined'>chevron_right</Icon>
								</Link>
							}
						</div>

						<div className={'notifications-card-time'}>
							{calculateTimeFromNow(new Date(notification?.created_at))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
});

export default NotificationCard;
