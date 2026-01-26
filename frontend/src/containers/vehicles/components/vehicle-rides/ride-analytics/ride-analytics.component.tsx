import React, {memo, useEffect, useState} from 'react';
import {getRequest} from '../../../../../api-service';
import API from '../../../../../API_ENDPOINTS.constant';
import KPI from '../../../../../components/shared/kpi/kpi.component';
import Loader from '../../../../../components/shared/loader/loader.component';
import LOADER_TYPE from '../../../../../loader.constant';
import { Icon } from '@mui/material';
import { formatDateWithYearAndTime } from '../../../../../utils/date.utils';

const RideAnalytics = memo((props: any) => {
	const {vehicleId, fromDate, toDate, reg_num} = props;

	const [analyticsData, setAnalyticsData] = useState<any>(null);

	const [loading, setLoading] = useState(false);

	useEffect(() => {
		setLoading(true)
		if (fromDate && toDate) {
			(async () => {
				let paramToDate = new Date(new Date(toDate).setHours(23, 59, 59));
				const currentDate = new Date();
				if (paramToDate.getDate() === currentDate.getDate() && paramToDate.getMonth() === currentDate.getMonth() && paramToDate.getFullYear() === currentDate.getFullYear()) {
					paramToDate = new Date(paramToDate.setHours(currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds()));
				}

				const analyticsResponse: any = await getRequest(
					API.GET_RIDE_ANALYTICS,
					{
						vehicle_ids: `[${vehicleId}]`,
						from: fromDate,
						to: paramToDate,
						reg_num
					}
				);

				if (analyticsResponse && analyticsResponse.data) {
					setAnalyticsData(analyticsResponse.data.data)
				}

				return () => analyticsResponse.signal.abort();
			})().then(() => setLoading(false));
		}
	}, [fromDate?.toString(), toDate?.toString()]);

	const isAnalytics = (): boolean => {
		const analytics = analyticsData;
		if(!analytics) return false;
		return Object.keys(analytics).some((key: string) => analytics[key] > 0)
	}

	return (
		<>
			{
				!loading && isAnalytics() ? (
					<div style={{minHeight: '80vh'}}>
						<div className='xs-font grey-font flex flex-center-gap' style={{position: 'absolute', right: '1vw', padding: 6}}>
							Last updated at: {formatDateWithYearAndTime(analyticsData?.data?.updated_at)}
						</div>
						<div className={'ride-analytics-container'}>
							{
								Object.entries(analyticsData).map(([key, value]: [any, any], index: number) => (
									key !== 'updated_at' ? <KPI key={index} title={key} value={value} unit={undefined}/> : ''
								))
							}
						</div>
					</div>
				) : (
					loading ? <Loader type={LOADER_TYPE.COMPONENT}/>
						: (
							<div className='flex flex-center flex-justify-center flex-column empty-state'>
								<Icon className='xlg-font material-symbols-outlined'>troubleshoot</Icon>
								<div className='xs-font'>No analytics available for selected date range, please update filter.</div>
							</div>
						)
				)
			}
		</>
	);
});

export default RideAnalytics;
