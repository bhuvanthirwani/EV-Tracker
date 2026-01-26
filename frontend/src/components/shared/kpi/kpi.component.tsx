import React, {memo} from 'react';
import './kpi.style.css';
import {Skeleton} from '@mui/material';

const KPI = memo((props: any) => {
	const {title, unit, value} = props;

	const fillColor = (title: string, value: number) => {
		if ((title === 'avg_wh_per_km' && value > 100) || (title === 'score' && value < 90 && value > 0)) {
			return '';
		} else if ((title === 'avg_wh_per_km' && value < 100 && value > 0) || (title === 'score' && value > 90)) {
			return 'lt_100';
		} else {
			return '';
		}
	}

	return (
		<div className={'kpi-container'}>
			<h5>{title.split('_').join(' ').toUpperCase()}</h5>
			<div>{unit}</div>
			<h1 className={fillColor(title, value)}>{value >= 0 ? value : <Skeleton style={{width: '4vw'}} variant={'text'} />}</h1>
		</div>
	);
});

export default KPI;
