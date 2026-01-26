import React, { useEffect, useState } from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Icon from '@mui/material/Icon';
import { Link } from 'react-router-dom';
import AppPath from '../../../../AppPath.constants';
import { getRequest } from '../../../../api-service';
import API from '../../../../API_ENDPOINTS.constant';
import { AxiosResponse } from 'axios';
import Loader from '../../../../components/shared/loader/loader.component';
import LOADER_TYPE from '../../../../loader.constant';
import { formatDate } from '../../../../utils/date.utils';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { enIN } from 'date-fns/locale';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';


export const BatteryReport = (props: any) => {
	const [reportData, updateReportData] = useState([]);
	const [loader, updateLoader] = useState(false);
	const [error, handleError] = useState(null);

	useEffect(() => {
		fetchReportData();
	}, []);

	const fetchReportData = async () => {
		updateLoader(true);
		return await getRequest(
			`${API.GET_BATTERY_REPORT}`,
			{
				cities: '[all]',
				vehicles: '[all]',
				last_n_days: 1,
				clients: '[all]'
			})
			.then((resp: AxiosResponse) => {
				updateLoader(false);
				updateReportData(resp.data.chargings);
			})
			.catch((error) => {
				updateLoader(false);
				handleError(error);
			});
	}


	return (
		<div className={'reports-container'}>
			<div className={'reports-filter-section'}>
				<Breadcrumbs separator={<Icon className='material-symbols-outlined'>chevron_right</Icon>}>
					<Link to={AppPath.DASHBOARD}>Home</Link>
					<Link to={AppPath.BATTERY_REPORT}>Battery Report</Link>
				</Breadcrumbs>

				<div className={'date-filter'}>
					<LocalizationProvider adapterLocale={enIN} dateAdapter={AdapterDateFns}>
						<DatePicker
							disabled={true}
							label="From Date"
							value={new Date()}
							onChange={(newValue: any) => new Date()}
							slotProps={{ textField: { variant: 'outlined' } }}
						/>

						<DatePicker
							disabled={true}
							label="To Date"
							value={new Date()}
							onChange={(newValue: any) => new Date()}
							slotProps={{ textField: { variant: 'outlined' } }}
							maxDate={new Date()}
						/>
					</LocalizationProvider>

					<div>
						<button className="ev-btn"><Icon className='material-symbols-outlined'>file_download</Icon> Download</button>
					</div>
				</div>
			</div>
			{
				loader
					? <Loader type={LOADER_TYPE.FULL_PAGE} />
					: (
						<div className="table-container">
							<table className="table">
								<thead>
									<tr>
										<th>Charging Status</th>
										<th>Vehicle Category</th>
										<th>Registration Number</th>
										<th>Start soc</th>
										<th>End soc</th>
										<th>Start Time</th>
										<th>End Time</th>
										<th>Energy Consumed</th>
										<th>Approx Amount</th>
									</tr>
								</thead>
								<tbody>
									{
										reportData && reportData.length && reportData.map((row: any, key) => {
											return (
												<tr key={key}>
													<td>{row.charging_status || '-'}</td>
													<td>{row.vehicle_category || '-'}</td>
													<td>{row.registration_number || '-'}</td>
													<td>{row.start_soc || '-'}</td>
													<td>{formatDate(row.end_soc) || '-'}</td>
													<td>{formatDate(row.start_time) || '-'}</td>
													<td>{row.end_time || '-'}</td>
													<td>{row.energy_consumed || '-'}</td>
													<td>{row.approx_amount || '-'}</td>
												</tr>
											)
										})
									}
								</tbody>
							</table>
						</div>
					)
			}
			{error ? 'Something Went Wrong!' : null}
		</div>
	);
}

export default BatteryReport;
