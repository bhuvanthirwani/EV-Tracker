import React, {
	useEffect,
	useState
} from 'react';
import Sidebar from '../../../../components/shared/sidebar/sidebar.container';
import { Icon } from '@mui/material';
import Map from '../../../../components/shared/map/map.container';
import './book-charging-confirmation.component.css';
import AppPath from '../../../../AppPath.constants';
import { formatDate } from '../../../../utils/date.utils';
import { useHistory } from 'react-router';
import { useLocation } from 'react-router-dom';
import VehicleUtility from '../../../../utils/vehicle.utility';
import { MapRenderTypes } from '../../../../components/shared/map/map.utility';

const BookChargingConfirmation = (props: any) => {
	const location = useLocation<any>();
	const [bookingInfo, updateBookingInfo] = useState(location?.state?.data);

	useEffect(() => updateBookingInfo(location?.state?.data), []);

	const [renderMap, setMapRendering] = useState<boolean>(false);

	const onClickGetDirection = () => setMapRendering(!renderMap);

	const history = useHistory();

	const renderSidebarContent = () => {
		const vehicleNum = VehicleUtility.readRegistrationNumber(bookingInfo?.vehicle);
		const hubName = bookingInfo?.hub?.hub_name;
		const time = formatDate(bookingInfo?.info?.slot_start_dt).slice(9);
		const date = formatDate(bookingInfo?.info?.slot_start_dt).slice(0, 8);

		return (
			<div className="flex flex-column-vert-center flex-center charging-confirmation-container">
				<Icon className={'success-icon material-symbols-outlined'}>done</Icon>
				<h4 className="success-msg">BOOKING SUCCESSFUL!</h4>
				<div className="caption">Congratulations, your slot for charging has been booked</div>
				<div className={'w-card'}>
					<div className="flex flex-center flex-between booking-info">
						<span className="w-card-hd">BOOKING DETAILS</span>
						<div><button className="btn-modify" onClick={() => history.push(AppPath.BOOKING, { ...bookingInfo })}>Modify</button></div>

					</div>

					<div className="flex flex-center booking-info"><Icon className='material-symbols-outlined'>navigation</Icon> {vehicleNum}</div>
					<div className="flex flex-center booking-info"><Icon className='material-symbols-outlined'>ev_station</Icon> {hubName}</div>
					<div className="flex flex-between flex-center">
						<span className="flex flex-center booking-info">
							<Icon className='material-symbols-outlined'>event_available</Icon>
							{date}
						</span>
						<span className="flex flex-center booking-info"><Icon className='material-symbols-outlined'>schedule</Icon>{time}
						</span>
					</div>
				</div>

				<button className="btn-direction" onClick={onClickGetDirection}>
					{renderMap ? 'Hide ' : 'Show '}Direction
				</button>

				<div className="flex flex-center-gap flex-between booking-info nav-button-container">
					<button className="btn-back" onClick={() => history.push(`${AppPath.VEHICLES}`)}>
						Go back to Home
					</button>

					<button className="btn-book-slot" onClick={() => history.push(`${AppPath.BOOKING}`)}>
						Book another Slot
					</button>
				</div>
			</div>
		);
	}
	return (
		<div className={renderMap ? 'ev-sidebar-map-container reversed' : 'ev-sidebar-map-container hide-map'}>
			<Sidebar
				backlink={`${AppPath.CHARGING_STATION}/book`}
				title={{ show: true, text: 'Book Charging' }}
				content={renderSidebarContent()}
			/>
			{
				renderMap && (
					<Map
						{...{
							markerDisplay: VehicleUtility.readVehicleMarkerTitle(bookingInfo?.vehicle),
							start: bookingInfo?.vehicle?.location,
							end: bookingInfo?.hub?.location,
							type: MapRenderTypes.DIRECTIONS,
							renderMap: renderMap
						}}
					/>
				)
			}
		</div>
	);
}

export default BookChargingConfirmation;
