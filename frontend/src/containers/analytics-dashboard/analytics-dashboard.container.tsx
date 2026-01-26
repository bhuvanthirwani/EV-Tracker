import React, {
	useEffect,
	useState
} from 'react';
import { AxiosResponse } from 'axios';

import Loader from '../../components/shared/loader/loader.component';
import { getRequest } from '../../api-service';
import './analytics-dashboard.style.css';
import LOADER_TYPE from '../../loader.constant';
import ChartsComponent from '../../components/shared/charts/charts.component';
import API from '../../API_ENDPOINTS.constant';
import { Icon, IconButton, Tooltip, Tabs, Tab, Box, Paper, Typography } from '@mui/material';
import { createPageTitle } from '../../utils';
import LiveTelemetry from '../../components/LiveTelemetry';

const AnalyticsDashboardContainer = () => {
	document.title = createPageTitle(1);
	const [data, updateData] = useState([]);

	const [loader, updateLoader] = useState(false);

	const [filterDays, setDaysFilter] = useState(1);

	/* An array of objects. Each object has two properties: text and value. */
	const daysFilter = [
		{
			text: 'Today',
			value: 1
		},
		{
			text: 'Last 7 Days',
			value: 7
		},
		{
			text: 'Last 30 Days',
			value: 30
		}
	];

	/* A react hook which is called whenever the filterDays state is changed. */
	useEffect(() => {
		fetchAnalyticsData();
	}, [filterDays]);

	/**
	 * It fetches data from the API and updates the state of the component
	 */
	const fetchAnalyticsData = () => {
		updateLoader(true);
		getRequest(
			API.GET_ALL_REPORT,
			{
				cities: '[all]',
				vehicles: '',
				last_n_days: filterDays,
				clients: '[all]'
			})
			.then((resp: AxiosResponse) => {
				updateLoader(false);
				updateData(resp?.data?.charts || []);
			}).finally(() => updateLoader(false));
	}

	/* Tab State and Change Handler */
	const [tabValue, setTabValue] = useState(0);

	const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
		setTabValue(newValue);
	};

	return (
		<div className={'dashboard-container'}>
			<div className="dashboard-controls" style={{ padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0' }}>
				<Tabs
					value={tabValue}
					onChange={handleTabChange}
					aria-label="dashboard tabs"
					sx={{
						'& .MuiTab-root': {
							textTransform: 'none',
							fontWeight: 600,
							fontSize: '0.8rem',
							overflow: 'visible',
						},
						'& .Mui-selected': {
							color: 'var(--primary-color)',
						},
						'& .MuiTabs-indicator': {
							color: 'white',
							backgroundColor: 'var(--primary-color)',
						}
					}}
				>
					<Tab label="Overview" />
					<Tab label="Analysis" />
				</Tabs>

				<div className={'filters-container'} style={{ padding: 0, border: 'none' }}>
					<div className={'days-filters'}>
						{
							daysFilter.map((filter, key) =>
								<span
									key={key}
									className={filter.value === filterDays ? 'active' : ''}
									onClick={() => setDaysFilter(filter.value)}
								>{filter.text}</span>
							)
						}
					</div>
				</div>
			</div>

			<div className={'dashboard-content'}>
				<TabPanel value={tabValue} index={0}>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
						<LiveTelemetry />
						<Paper elevation={0} sx={{ p: 4, textAlign: 'center', color: 'text.secondary', bgcolor: 'background.paper', borderRadius: 2 }}>
							<Typography variant="h5" gutterBottom>Overview Dashboard</Typography>
							<Typography variant="body1">Real-time fleet status and map view.</Typography>
						</Paper>
					</Box>
				</TabPanel>

				<TabPanel value={tabValue} index={1}>
					{
						loader
							? <Loader type={LOADER_TYPE.FULL_PAGE} />
							: (
								<div className={'charts-container'}>
									{
										data?.length && data.map((chart: any) => {
											return (
												<React.Fragment key={chart.id}>
													{
														chart?.id !== 4
															? (
																<div className={'chart-area'}>
																	<div className="chart-header">
																		<div className='flex flex-between'>
																			<div className="chart-value">
																				{new Intl.NumberFormat('en-IN').format(chart?.value)}
																				<span className={'chart-unit'}>{chart?.unit?.y}</span>
																				{
																					chart.change
																						? (<span
																							className={chart.value < 0 ? 'red value-change' : 'value-change'}>
																							{chart.change}%
																						</span>)
																						: ''
																				}
																			</div>
																			{
																				chart?.info && <Tooltip title={chart?.info}>
																					<IconButton size="large">
																						<Icon className='xs-font material-symbols-outlined'>info</Icon>
																					</IconButton>
																				</Tooltip>
																			}
																		</div>
																		<span className={'chart-title'}>{chart?.title}</span>
																	</div>
																	<ChartsComponent
																		id={chart.id}
																		chartConfig={{
																			type: chart.type,
																			title: chart.title,
																			data: chart?.data?.length ? chart.data.map((datum: any) => Object.values(datum)[0]) : [],
																			labels: chart?.data?.length ? chart.data.map((datum: any) => Object.keys(datum).toString()) : [],
																			meta: {
																				legend: chart?.legends,
																				unit: chart?.unit
																			}
																		}}
																	/>
																</div>
															)
															: ''
													}
												</React.Fragment>
											);
										})
									}
								</div>
							)
					}
				</TabPanel>
			</div>
		</div>
	);
}

interface TabPanelProps {
	children?: React.ReactNode;
	index: number;
	value: number;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`simple-tabpanel-${index}`}
			aria-labelledby={`simple-tab-${index}`}
			{...other}
			style={{ height: '100%', overflowY: 'auto' }}
		>
			{value === index && (
				<Box>
					{children}
				</Box>
			)}
		</div>
	);
}


export default AnalyticsDashboardContainer;
