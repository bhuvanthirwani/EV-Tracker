import React, { memo, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon, IconButton, Skeleton, Tooltip } from '@mui/material';

import AppPath from '../../../../AppPath.constants';
import { SnackbarContext } from '../../../../App';
// @ts-ignore
import ChargingBoxIcon from '../../../../assets/images/charging-hubs/charging-box-icon.svg';
import { SnackProps } from '../../../../components/shared/snackbar.component';
import { LOCATION_DENY_MESSAGE } from '../../charging-stations.container';

const CHARGING_TYPES = {
	'AC': 0,
	'DC': 0
}

const ChargingStationCard = memo((props: any) => {

	const { setSnackState } = useContext(SnackbarContext);

	const { chargingHub, address, availableSlots, provider, distance } = props;

	const [connectorType, setConnectorType] = useState({ ...CHARGING_TYPES });

	useEffect(() => {
		CHARGING_TYPES['DC'] = 0;
		CHARGING_TYPES['AC'] = 0;

		if (chargingHub?.connectors.length) {
			for (const connector of chargingHub.connectors) {
				if (connector.power_type.toLowerCase().includes('dc') || connector.standard.toLowerCase().includes('dc')) {
					CHARGING_TYPES['DC'] += 1
				} else if (connector.power_type.toLowerCase().includes('ac') || connector.standard.toLowerCase().includes('ac')) {
					CHARGING_TYPES['AC'] += 1
				} else if (provider.toLowerCase() === 'ev') {
					CHARGING_TYPES['DC'] = 1 * chargingHub.total_slots;
					CHARGING_TYPES['AC'] = 1 * chargingHub.total_slots;
				} else return;
			}
			setConnectorType({ ...CHARGING_TYPES });
		}
	}, [chargingHub]);

	const handleSnackbarClose = () => {
		setSnackState({ ...snackProps });
	}

	const snackProps: SnackProps = {
		open: false,
		severity: 'success',
		message: '',
		onClose: handleSnackbarClose
	};

	const copyLocation = (location: any) => {
		const locationURI = `https://www.google.com/maps/search/?api=1&query=${location?.latitude}%2C${location?.longitude}`;

		navigator.clipboard
			.writeText(locationURI)
			.then(() => {
				setSnackState({ ...snackProps, open: true, message: 'Copied to Clipboard!' });
			});
	}


	return (
		<div className="charge-station-cards-container standard-padding border">
			<div className={'charge-station-card'}>
				<div className="card-elements-container">
					<div className="active-text sm-font flex flex-center-gap flex-justify-between">
						<div className='flex flex-center-gap'>
							<span>{'Open' || <Skeleton variant={'text'} />}</span>
							<span className="km sm-font">
								{
									distance
										? `${distance} kms away`
										: (
											<Tooltip title={LOCATION_DENY_MESSAGE}>
												<IconButton size="large">
													<Icon className='xs-font material-symbols-outlined'>info</Icon>
												</IconButton>
											</Tooltip>)
								}
							</span>
						</div>

						<button className='ev-btn standard-padding-small border' onClick={() => copyLocation(chargingHub.location)}>
							<Icon className='material-symbols-outlined'>share</Icon> Share
						</button>
					</div>

					<div>
						<div className="station-name">{chargingHub?.hub_name}</div>
						<div className="address">
							{address || <Skeleton variant={'text'} />}
						</div>
					</div>



					<div className="connector-types">
						<div>
							<span>DC ({connectorType['DC']})</span>
							<span>AC ({connectorType['AC']})</span>
							<span>{chargingHub?.connectors[0]?.max_electric_power || 3.3} kw</span>
						</div>
						<div className="flex flex-center flex-center-gap xs-font"><span className='grey-font'>Operated by:</span>{provider}</div>
					</div>
				</div>

				<div className="card-elements-container flex-end">
					{
						chargingHub?.total_slots && availableSlots > 0
						&& (
							<div className="flex flex-center">
								<span className="slots-left" title={'Available slots'}>
									<img height="16px" src={ChargingBoxIcon} alt="chg-st" />
									<span>{availableSlots} left</span>
								</span>
								<span className="total-slots" title={'Total slots'}>({chargingHub?.total_slots})</span>
							</div>
						)
						|| (
							''
						)
					}

					<div className="flex flex-center">
						{
							availableSlots > 0 &&
							(
								<Link to={{ pathname: `${AppPath.CHARGING_STATION}/book`, state: { chargingHub: chargingHub } }}>
									<button className="btn-book">
										Book Now
									</button>
								</Link>
							)
						}
					</div>
				</div>
			</div>
		</div>
	);
});

export default ChargingStationCard;
