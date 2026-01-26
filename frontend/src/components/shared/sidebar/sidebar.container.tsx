import React, {
	memo,
	ReactElement
} from 'react';
import {Link} from 'react-router-dom';
import Icon from '@mui/material/Icon';
import {
	FormControl,
	InputAdornment,
	InputLabel,
	MenuItem,
	Select,
	Skeleton,
	TextField
} from '@mui/material';
import './sidebar.style.css';
import VehicleStatusFilter from '../../../containers/vehicles/components/vehicle-status/vehicle-status.component';

export interface SidebarProps {
	backlink?: any | undefined;
	contentPadding?: string,
	height?: string,
	title?: {
		show: boolean,
		text: string
	} | undefined,
	subHeader?: {
		component?: ReactElement<any, any>
	} | undefined,
	filters?: {
		search?: {
			show: boolean,
			placeholder?: string,
			label?: string,
			value?: string,
			changeAction?: any,
			eventName?: string,
		} | undefined,
		dropdown?: {
			show: boolean,
			options?: Array<any>,
			label?: string,
			defaultValue?: any,
			changeAction?: any
		} | undefined,
		statusFilter?: {
			show: boolean,
			statusData?: any,
			selectedFilter?: any,
			changeAction?: any
		} | undefined
	},
	button?: {
		text: string;
		action: any;
		show?: boolean;
	} | undefined,
	menu?: {
		component?: ReactElement<any, any>
	} | undefined,
	timer?: {
		component?: ReactElement<any, any>
	} | undefined,
	content?: any,
	stats?: Array<{
		title: string,
		count: number
	}> | undefined,
	statusList?: Array<any> | any | undefined
}


const Sidebar = (props: SidebarProps) => {
	// @ts-ignore
	const {filters, button, backlink, title, content, lowBatteryCard, menu, timer, subHeader, contentPadding, height, statusList} = props;

	return (
		<div className={location.pathname.includes('live') ? 'sidebar-container share_live-bg' : 'sidebar-container'}>
			<div className={'sidebar-header'} style={{background: location.pathname.includes('live') ? 'none' : 'inherit'}}>
				<div className={'flex-between'}>
					<div className={'flex flex-center flex-center-gap'}>
						{backlink && <Link to={backlink}><Icon className='material-symbols-outlined'>arrow_back</Icon></Link>}
						{title && title.show && <span className={'sidebar-title'}>{title.text || <Skeleton variant={'text'} width={150}/>}</span>}
					</div>
					<div className={'flex flex-center'}>
						{
							statusList ? renderStatusList(statusList) : ''
						}
						{
							timer && timer.component ? timer.component : ''
						}
						{
							menu && menu.component ? menu.component : ''
						}
					</div>
				</div>
				<div className={'flex flex-center-gap'}>
					{
						filters && filters.search && filters.search.show
						&& <TextField
							label={filters?.search?.label}
							style={{width: filters?.dropdown?.show ? '80%' : '100%'}}
							placeholder={filters?.search?.placeholder}
							variant={'outlined'}
							value={filters?.search?.value}
							onChange={filters?.search?.changeAction}
							onLoad={filters?.search?.changeAction}
							name={filters?.search?.eventName}
							InputProps={{
								startAdornment: <InputAdornment position="start"><Icon className='material-symbols-outlined'>search</Icon></InputAdornment>,
							}}
						/>
					}
					{
						filters?.dropdown?.show
						? (
							<FormControl style={{width: '20%'}}>
								<InputLabel id={filters?.dropdown?.label}>{filters?.dropdown?.label}</InputLabel>
								<Select
									label={filters?.dropdown?.label}
									value={filters?.dropdown?.defaultValue}
									onChange={filters?.dropdown?.changeAction}
									variant={'outlined'}
								>
									{filters?.dropdown?.options?.map((option: any) => (
										<MenuItem key={option.value} value={option.value}>
											{option.label}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						)
						: ''
					}
				</div>
				{subHeader && subHeader.component}
				{
					(filters?.statusFilter && filters?.statusFilter.show)
					&& <VehicleStatusFilter
						selectedFilter={filters?.statusFilter?.selectedFilter}
						updateSelectedFilter={filters?.statusFilter?.changeAction}
						filterStatusData={filters?.statusFilter?.statusData}
					/>
				}
			</div>

			<div style={{padding: contentPadding || 0, height: height || '100%'}} onClick={e => e.stopPropagation()}>
				{content}
			</div>

			<div className={'sidebar-button'}>
				{button && button?.show ? <button onClick={button.action}>{button.text}</button> : ''}
			</div>
		</div>
	);
}

const renderStatusList = (statusList: Array<any> | any) => {
	if (statusList && statusList.length) {
		for (const status in statusList) {
			return status;
		}
	} else {
		return statusList;
	}
}

export default memo(Sidebar);
