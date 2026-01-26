import { Icon, Skeleton, Tooltip } from '@mui/material';
import React, { memo, useEffect, useState } from 'react';
import { getFormattedAddress } from '../../../../../utils/shared.api';
import './ride-card.component.css';
// @ts-ignore
import live_trip from '../../../../../assets/images/trips/live_trip.svg';

import { getRequest } from '../../../../../api-service';
import API from '../../../../../API_ENDPOINTS.constant';

const formatTime = (time: Date | any) => {
	time = time * 1000;
	return time ? new Intl.DateTimeFormat('en-in', { timeStyle: 'short' }).format(new Date(time)) : '';
}

const RideCard = memo((props: any) => {
	const { ride: trip, getWayPoints, show, tripInFocus, toggleTripInFocus, reg_num } = props;
	const analytics = trip?.analytics;

	const [startAddress, setStartAddress] = useState<any>(null);
	useEffect(() => {
		(async () => {
			const address = await getFormattedAddress({
				latitude: trip?.start?.location.latitude,
				longitude: trip?.start?.location.longitude,
			});
			if (address) setStartAddress(address);
		})();
	}, [trip.start?.location.latitude, trip.start?.location.longitude]);


	const getTripAnalytics = async (t_id: string, reg_num: string) => {
		const trip_analytics = await getRequest(API.GET_RIDE_ANALYTICS_BY_T_ID, { t_id, reg_num });

		if (trip_analytics?.data?.data) {
			trip['analytics'] = trip_analytics.data.data;
		}
	}

	const [endAddress, setEndAddress] = useState<any>(null);

	useEffect(() => {
		if (!trip.trip_ended) {
			setEndAddress('Current location');
		} else {
			(async () => {
				const address = await getFormattedAddress({
					latitude: trip?.end?.location.latitude,
					longitude: trip?.end?.location.longitude,
				});

				if (address) setEndAddress(address);
			})();
		}
	}, [trip.end?.location.latitude, trip.end?.location.longitude]);

	useEffect(() => {
		closeExpand(trip?.trip_id)
		toggleTripInFocus(trip?.trip_id, true);
	}, [trip?.trip_id]);

	const _setElementStyle = (selector: string, value: string): void => {
		// @ts-ignore
		document.getElementById(selector)?.style?.display = value;
	}

	const handleClick = (trip_id: any, force = false) => {
		if (!toggleTripInFocus(trip_id, force)) {
			return;
		}

		if (tripInFocus) closeExpand(tripInFocus);
		if (trip.trip_id !== trip_id) {
			return;
		}

		getWayPoints(trip?.trip_id);
		if (trip?.trip_ended) {getTripAnalytics(trip?.trip_id, reg_num);}
		_setElementStyle(`card${trip_id}`, 'none')
		_setElementStyle(`rideDetails${trip_id}`, 'block')
	}

	const closeExpand = (trip_id: any) => {
		_setElementStyle(`card${trip_id}`, 'grid');
		_setElementStyle(`rideDetails${trip_id}`, 'none');
	};

	return (
		<div key={trip?.trip_id} style={{ display: show ? 'block' : 'none', paddingBottom: '1vh' }}>
			<div
				className={`rides-list standard-padding border ${!trip?.trip_ended ? 'live_trip_bg' : ''}`}
				data-toggle="collapse"
				data-target="#rideDetails"
				aria-expanded="false"
				aria-controls="rideDetails"
				onClick={() => handleClick(trip?.trip_id, true)}
				id={`card${trip?.trip_id}`}
				title={'Click to see route/waypoints'}
			>
				<div className={'flex flex-column-vert-center'} style={{ width: '100%' }}>
					{
						(!trip.trip_ended) ?
							<div className='live_trip mb-2'>
								<img className='heartbeat-animation' height={20} width={20} src={live_trip} alt="live trip" />
								<span style={{ color: 'red' }}>Live</span>
								<span className='xs-font'>
									( Updates every 10 seconds )
								</span>
							</div> : ''
					}
					<span className="start-location">
						<Icon className={'start-icon'}>circle</Icon>
						{
							startAddress
								? <span className='text-overflow-ellipsis'>{startAddress}</span>
								: <Skeleton style={{ width: '100%' }} variant={'text'} />
						}
					</span>

					<div className="def-rem dashed-line" />

					<span className="end-location">
						<Icon className={'end-icon'}>circle</Icon>
						{
							endAddress
								? <span className='text-overflow-ellipsis'>{endAddress}</span>
								: <Skeleton style={{ width: '100%' }} variant={'text'} />
						}
					</span>
				</div>
				<div className="flex flex-center">
					<h3>{trip?.distance?.value}<span className="km">{trip?.distance?.unit}</span></h3>
				</div>
			</div>


			<div className="collapse" id={`rideDetails${trip?.trip_id}`}>
				<div className="collapse-bg">
					<div className="coll-blue-bg" />
					<div className="coll-card standard-padding border">
						{
							(!trip.trip_ended) ?
								<div className='live_trip'>
									<img height={24} width={24} src={live_trip} alt="live trip" />
									<span style={{ color: 'red' }}>Live</span>
									<span className='xxs-font'>
										(Updates every 10 seconds)
									</span>
								</div> : ''
						}
						<div className="def-rem card-location-info">
							<i className="ride-start-icon" />
							<span className="start-location ride_details text-overflow-ellipsis block" title={startAddress}>{startAddress || <Skeleton style={{ width: '100%' }} variant={'text'} />}</span>
						</div>
						<div className='flex flex-center-gap xs-font' style={{ padding: '0 8%' }}>
							<span>Start SoC: {trip?.start?.soc} %</span>
							<span>|</span>
							<span className="loc-time">{formatTime(trip?.start?.time)}</span>

							{/* <span>Start Odo: {trip?.start?.odo} kms</span> */}
						</div>
						{/*loop over ride locations*/}
						{/*EVENTS PART*/}
						{/*<div>
							<span className="line"/>
							<p className="def-rem card-location-info">
								<i className="fa fa-circle-thin"/>
								<span className="event-info">
									<span className=" track-point-name">{loc?.location}</span>
									{
										loc?.id == 1 &&
										<span className=" event-name">Event Name</span>}
									{
										loc?.id == 2 &&
										<span className="event-name red">Breakdown</span>
									}
								</span>
								<span className="time">{loc.time}</span>
							</p>
						</div>*/}
						<div className="line destination">
							{
								(!trip.trip_ended) && <h3>{trip?.distance?.value ? trip?.distance?.value : '--'}<span className="km">{trip?.distance?.unit}</span></h3>
							}
						</div>
						<div className="card-location-info">
							<i className="ride-end-icon" />
							<span className={'start-location ride_details text-overflow-ellipsis block'} title={endAddress}>{endAddress || <Skeleton style={{ width: '100%' }} variant={'text'} />}</span>
						</div>
						<div className='flex flex-center-gap xs-font' style={{ padding: '0 8%', }}>
							<span>End SoC: {trip?.end?.soc} %</span>
							<span>|</span>
							<span className="loc-time">{!trip.trip_ended ? formatTime(trip?.last_moved_at) : formatTime(trip?.end?.time)}</span>
							{/* <span>End Odo: {trip?.end?.odo} kms</span> */}
						</div>
						{
							(trip.trip_ended) &&
							<div>
								<div className="flex flex-between trip-stats standard-padding-small border">
									<h3>{trip?.distance?.value ? trip?.distance?.value : '--'}<span className="km">{trip?.distance?.unit}</span></h3>
									{
										analytics
											? <>
												<h3>{analytics?.energy_consumed?.value || '--'}<span className="km">{analytics.energy_consumed.unit}</span></h3>
												<h3 className='flex flex-center' style={{ color: 'var(--active)' }}>
													<Icon sx={{ color: 'inherit' }}>
														currency_rupee
													</Icon>
													<span>{analytics?.cost?.toFixed(2) || '--'}</span>
													<Tooltip title={`Rates @${analytics?.electricity_tariff_per_unit || '--'} rupees per unit`} className='info-tooltip'>
														<Icon className='xs-font material-symbols-outlined'>info</Icon>
													</Tooltip>
												</h3>
											</>
											: <Skeleton width={100}/>
									}
								</div>
								<div className={`flex ${analytics?.energy_consumed ? 'flex-justify-end' : 'flex-between'}`}>
									{
										!analytics?.energy_consumed && <span className='flex flex-center-gap error-text'>
											<Icon className='error-text xs-font material-symbols-outlined'>info</Icon>
											Energy consumption is not available.
										</span>
									}
									<Icon
										data-toggle="collapse"
										data-target="#rideDetails"
										aria-expanded="false"
										aria-controls="rideDetails"
										onClick={(event) => { event.stopPropagation(); closeExpand(trip?.trip_id) }}
										className={'close-expand-icon material-symbols-outlined'}
									>
										expand_less
									</Icon>
								</div>
							</div>
						}
					</div>
				</div>
			</div>
		</div>
	)
})

export default RideCard;
