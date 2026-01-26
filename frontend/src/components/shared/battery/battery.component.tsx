import React from 'react';
import { getConfig } from '../../../firebase.service';
import Tooltip from '@mui/material/Tooltip';

const batteryColor = '#0cd091';
const batteryPercentageInit = 0;


export const BatterySize = {
	S: 'small',
	M: 'medium',
	L: 'large'
}
export interface BatteryProps {
	batteryPercentage: number | undefined;
	batteryStatus: number;
	variant?: string
}

export const BatteryColorMap: any = {
	2: '#FE8A99',
	3: '#F6A623',
	7: '#f16677'
}

const BatteryStatusMap = getConfig('battery_status');

const Battery = (props: BatteryProps) => {
	const { batteryPercentage, batteryStatus, variant } = props;

	return (
		<Tooltip title={BatteryStatusMap?.[batteryStatus]}>
			<div style={{ display: 'inline-block' }}>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<div className='battery-style' style={{
						display: 'flex',
						border: variant ? '2px solid #80868b' : '1px solid #80868b',
						borderRadius: variant ? 10 : 4,
						width: variant ? '7vw' : '1.5vw',
						height: variant ? '2.2vw' : '0.75vw',
						padding: variant ? 2 : 1,
						// borderColor: variant ? BatteryColorMap[batteryStatus] : batteryColor
					}}>
						<div style={{
							height: '-webkit-fill-available',
							// border: '0.5px solid #80868b',
							borderRadius: variant ? 8 : 3,
							backgroundColor: BatteryColorMap[batteryStatus] || batteryColor,
							width: `${batteryPercentage || batteryPercentageInit}%`
						}} />
					</div>

					<div style={{
						display: 'inline-block',
						height: variant ? 14 : 4,
						width: variant ? 2 : 1,
						// backgroundColor: BatteryColorMap[batteryStatus] || batteryColor,
						backgroundColor: '#80868b',
						marginLeft: variant ? 2 : 0
					}} />
				</div>
			</div >
		</Tooltip>
	);
}

export default Battery;
