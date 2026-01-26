import React, { useEffect, useState } from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Icon from '@mui/material/Icon';
import { Link } from 'react-router-dom';
import AppPath from '../../../../AppPath.constants';
import './rides-report.component.css';
import { getRequest } from '../../../../api-service';
import { AxiosResponse } from 'axios';
import Loader from '../../../../components/shared/loader/loader.component';
import LOADER_TYPE from '../../../../loader.constant';
import { formatDate } from '../../../../utils/date.utils';
import API from '../../../../API_ENDPOINTS.constant';
import { enIN } from 'date-fns/locale';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';


export const RidesReport = (props: any) => {

	const [reportData, updateReportData] = useState([]);
	const [loader, updateLoader] = useState(false);
	const [error, handleError] = useState(null);

	useEffect(() => {
		fetchReportData();
	}, []);

	const fetchReportData = async () => {
		updateLoader(true);
		return await getRequest(
			`${API.GET_RIDE_REPORT}`,
			{
				cities: '[all]',
				vehicles: '[all]',
				last_n_days: 1,
				clients: '[all]'
			})
			.then((resp: AxiosResponse) => {
				updateLoader(false);
				updateReportData(resp.data.trips);
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
					<Link to={AppPath.RIDES_REPORT}>Rides Report</Link>
				</Breadcrumbs>

				<div className={'date-filter'}>
					<LocalizationProvider adapterLocale={enIN} dateAdapter={AdapterDateFns}>
						<DatePicker
							disabled={true}
							label="From Date"
							value={new Date()}
							onChange={(newValue: any) => new Date()}
							slotProps={{ textField: { variant: 'outlined', disabled: true } }}
						/>

						<DatePicker
							disabled={true}
							label="To Date"
							value={new Date()}
							onChange={(newValue: any) => new Date()}
							slotProps={{ textField: { variant: 'outlined', disabled: true } }}
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
										<th>Vehicle Category</th>
										<th>Registration Number</th>
										<th>Start Voltage</th>
										<th>End Voltage</th>
										<th>Start Time</th>
										<th>End Time</th>
										<th>Distance</th>
										<th>Waypoints</th>
									</tr>
								</thead>
								<tbody>
									{
										reportData && reportData.length && reportData.map((row: any, key) => {
											return (
												<tr key={key}>
													<td>{row.vehicle_category || '-'}</td>
													<td>{row.registration_number || '-'}</td>
													<td>{row.start_voltage || '-'}</td>
													<td>{row.end_voltage || '-'}</td>
													<td>{formatDate(row.start_time) || '-'}</td>
													<td>{formatDate(row.end_time) || '-'}</td>
													<td>{row.distance || '-'}</td>
													<td><Link to={row.waypoints} target="_blank">{row.waypoints}</Link></td>
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

export default RidesReport;
