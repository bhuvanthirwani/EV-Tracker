import React, { useState, useEffect, useContext } from 'react';
import Loader from '../../components/shared/loader/loader.component';
import LOADER_TYPE from '../../loader.constant';
import '../analytics-dashboard/components/rides-report/rides-report.component.css';
import './reports.css';
import {
    IconButton,
    Menu,
    Tooltip,
    Icon
} from '@mui/material';
import UserService from '../../services/user.service';
import VehicleUtility from '../../utils/vehicle.utility';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { enIN } from 'date-fns/locale';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { postRequest } from '../../api-service';
import TagsInput from '../../components/shared/tags-input/tags-input';
import DropDownObj from '../../components/shared/tags-input/tags-input';
import { createPageTitle, getLocalStoreItem } from '../../utils';
import API from '../../API_ENDPOINTS.constant';
import { SnackbarContext } from '../../App';
import { formatTimeWithDHM } from '../../utils/date.utils';
import EVAutocomplete from '../../components/shared/autocomplete/autocomplete.component';
import { defaultFromDate, defaultToDate } from '../../utils/date.utils';
import { USER_VEHICLES } from '../vehicles/vehicle.interface';


export interface DropDownObj {
    list: Array<string>,
    values: Array<string>,
    to_show: boolean,
    label: string
}


const Reports = () => {
    document.title = createPageTitle(1);
    const [loader, setLoader] = useState<any>({ fullPage: false, table: false, download: false });
    const [vehicles, setVehicles] = useState<any>([]);
    const [selectedVehicles, setSelectedVehicles] = useState<any>([]);
    const [fromDate, setFromDate] = useState<Date>(new Date(defaultFromDate));
    const [toDate, setToDate] = useState<Date>(defaultToDate);
    const [emails, setEmails] = useState<Array<string>>();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [reportType, setReportType] = useState<null | string>(null);
    const [reportData, setReportData] = useState<any>(null);
    const [filteredReportData, setFilteredReportData] = useState<any>(null);
    const [reportHeaderKey, setReportHeaderKey] = useState<Array<string>>([]);
    const [filter, setFilter] = useState<any>({ column: -1, type: '' });
    const [error, setError] = useState<any>({ isError: false, message: '' });
    const [info, setInfo] = useState<any>('');

    const { snackState, setSnackState } = useContext<any>(SnackbarContext);

    useEffect(() => {
        (async () => {
            setLoader({ ...loader, fullPage: true });

            const userVehicles = await UserService.getUserById();
            setVehicles(userVehicles);

            const email = JSON.parse(getLocalStoreItem('user') as string)?.email;
            handleEmails(email ? [email] : []);

            setLoader({ ...loader, fullPage: false });
        })();
    }, []);

    useEffect(() => {
        (async () => {
            error.isError && setError({ isError: false, message: '' });
            setLoader({ ...loader, table: true });
            setFilter({ column: -1, type: '' });

            const response = await postRequest(
                API.ALL_VEHICLE_DATA,
                {
                    _from: btoa(fromDate.toISOString()),
                    _to: btoa(toDate.toISOString())
                }
            );

            const data = response?.data?.message;

            setInfo(<ul>{data?.info.map((info: string) => <li>{info}</li>)}</ul>)

            if (!data) {
                return setLoader({ ...loader, table: false });
            }

            const numberOfEntries = data?.rows_length;
            const columns = data?.columns;

            const columnKeys = new Array(Object.keys(columns)?.length);
            Object.keys(columns)?.map((columnKey: string) => {
                columnKeys[columns?.[columnKey]?.metadata?.order - 1] = columnKey;
            })

            setReportHeaderKey(columnKeys);

            const reportDataArray: any = [];
            const headers: any = {};
            for (let index = 0; index < numberOfEntries; index++) {
                const singleVehicleReport: any = new Array(columnKeys.length);
                columnKeys?.map((key: string) => {
                    if (index === 0) {
                        headers[key] = columns?.[key]?.metadata;
                    }
                    singleVehicleReport[columns?.[key]?.metadata?.order - 1] = columns?.[key]?.data?.[index];
                })
                reportDataArray.push(singleVehicleReport);
            }

            setReportData({ headers: headers, data: reportDataArray });
            setFilteredReportData({ headers: headers, data: reportDataArray });
            setLoader({ ...loader, table: false });
        })();
    }, [fromDate.toString(), toDate.toString()]);

    const handleEmails = (items: Array<string>) => setEmails(items);

    const handleFromDateChange = (newDate: Date) => {
        setFromDate(new Date(newDate.setHours(0, 0, 0)));
    }

    const handleToDateChange = (newDate: Date) => {
        setToDate(new Date(newDate.setHours(23, 59, 59)));
    }

    const handleDownload = async (downloadType: string) => {
        setLoader({ ...loader, download: true });

        let paramToDate = new Date(toDate);
        const currentDate = new Date();
        if (paramToDate.getDate() === currentDate.getDate()
            && paramToDate.getMonth() === currentDate.getMonth()
            && paramToDate.getFullYear() === currentDate.getFullYear()
        ) {
            paramToDate = new Date(paramToDate.setHours(currentDate.getHours(), currentDate.getMinutes(), currentDate.getSeconds()));
        }

        let response: any;

        const vehicleIMEIArray: any = [];
        selectedVehicles.length && selectedVehicles.map((vehicle: any) => {
            vehicleIMEIArray.push(VehicleUtility.readIMEI(vehicle));
        });

        const vehicleRegNumList: any = [];
        selectedVehicles.length && selectedVehicles.map((vehicle: any) => {
            vehicleRegNumList.push(VehicleUtility.readRegistrationNumber(vehicle));
        });

        const vehicleChassisNumList: any = [];
        selectedVehicles.length && selectedVehicles.map((vehicle: any) => {
            vehicleChassisNumList.push(VehicleUtility.readChassisNumber(vehicle));
        });

        if (reportType === 'summarized') {
            // @ts-ignore
            gtag('event', 'download_summarized_report');
            response = await postRequest(
                API.ALL_VEHICLE_REPORT,
                {
                    _from: btoa(fromDate.toISOString()),
                    _to: btoa(paramToDate.toISOString()),
                    emails: btoa(`[${emails}]`),
                    vehicles: btoa(`[${vehicleRegNumList}]`),
                    _type: btoa(downloadType?.toLowerCase() + '_' + reportType?.toLowerCase())
                }
            );
        } else {
            if (reportType === 'charging') {
                // @ts-ignore
                gtag('event', 'download_charging_report');

                response = await postRequest(
                    API.CHARGING_REPORT,
                    {
                        _from: btoa(fromDate.toISOString()),
                        _to: btoa(paramToDate.toISOString()),
                        emails: btoa(`[${emails}]`),
                        vehicles: btoa(`[${vehicleRegNumList}]`),
                        _type: btoa(downloadType?.toLowerCase() + '_' + reportType?.toLowerCase()),
                        imei: btoa(`[${vehicleIMEIArray}]`),
                        chassis_numbers: btoa(`[${vehicleChassisNumList}]`)
                    }
                );
            } else {
                // @ts-ignore
                gtag('event', 'download_trips_report');
                response = await postRequest(
                    API.TRIP_REPORT,
                    {
                        _from: btoa(fromDate.toISOString()),
                        _to: btoa(paramToDate.toISOString()),
                        emails: btoa(`[${emails}]`),
                        registration_number_list: btoa(`[${vehicleRegNumList}]`),
                        imei_list: btoa(`[${vehicleIMEIArray}]`)
                    }
                ).catch((event: any) => {
                    setSnackState({
                        ...snackState,
                        message: response?.data?.error,
                        open: true,
                        severity: 'error',
                        onClose: () => setSnackState({ ...snackState, open: false })
                    });
                });
            }
        }

        setLoader({ ...loader, download: false });

        setAnchorEl(null);

        if (response?.status) {
            setSnackState({
                ...snackState,
                message: response?.data?.message,
                open: true,
                severity: 'success',
                onClose: () => setSnackState({ ...snackState, open: false })
            });
        }
    }

    // @ts-ignore
    const getDateDifference = (date1: Date, date2: Date) => Math.abs((date1 - date2) / (1000 * 60 * 60 * 24));

    const renderMenuContent = () => {
        const dateDifference = getDateDifference(fromDate, toDate);
        return <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            MenuListProps={{
                'aria-labelledby': 'basic-button',
            }}
            className='popup-box'
        >
            <TagsInput
                defaultValue={emails}
                selectedTags={handleEmails}
                dropdownSelect={setReportType}
                fullWidth
                variant="outlined"
                id="tags"
                name="emails"
                placeholder="Add Email/s"
                label="Email/s"
            />
            <div className={'active-text'}>Press enter to add email/s.</div>

            <div className='flex flex-center-gap flex-justify-end'>
                <button
                    className='cancel-btn'
                    onClick={() => {
                        setAnchorEl(null)
                    }}
                >
                    Cancel
                </button>

                {
                    loader.download
                        ? <Loader type={LOADER_TYPE.COMPONENT} />
                        : <button
                            className='apply-btn'
                            disabled={!emails?.length || dateDifference > 31}
                            onClick={() => handleDownload('excel')}
                        >
                            Request Report
                        </button>
                }
            </div>
        </Menu>
    }

    useEffect(() => {
        if (selectedVehicles?.length && !selectedVehicles.some((vehicle: any) => vehicle?.imei?.includes('all'))) {
            const registrationNumbersFiltered = selectedVehicles.flatMap((vehicle: USER_VEHICLES) => vehicle?.v_reg_num)
            const reportDataArray = reportData?.data?.filter((vehicleData: any) => registrationNumbersFiltered.includes(vehicleData[0]));
            setFilteredReportData({ headers: { ...reportData?.headers }, data: reportDataArray });
        } else {
            setFilteredReportData({ ...reportData });
        }
    }, [selectedVehicles?.length, reportData])


    const sortTable = (column: number) => {
        const reportDataArray = filteredReportData?.data;
        const isSortedAscending = filter.column === column && filter.type === 'asc';

        reportDataArray.sort((a: any, b: any) => {
            if (isSortedAscending) {
                return (reportHeaderKey?.[column] === 'registration_number') ? b[column].localeCompare(a[column]) : b[column] - a[column];
            } else {
                return (reportHeaderKey?.[column] === 'registration_number') ? a[column].localeCompare(b[column]) : a[column] - b[column];
            }
        });

        setFilter({ column: column, type: isSortedAscending ? 'desc' : 'asc' });
        setFilteredReportData({ ...reportData, data: reportDataArray });
    }

    return <>
        {
            loader?.fullPage
                ? <Loader type={LOADER_TYPE.FULL_PAGE} />
                : <div className='reports-container-wrapper flex flex-column-vert-center'>
                    <div className='reports-header'>
                        <EVAutocomplete
                            id={'report-autocomplete'}
                            data={vehicles}
                            defaultValue={[]}
                            label={'Select Vehicles'}
                            placeholder={'ex. 8XYZ123'}
                            changeHandler={setSelectedVehicles}
                            optionKey={'v_reg_num'}
                            group={true}
                            isSelectAll={true}
                        />
                        <LocalizationProvider adapterLocale={enIN} dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="From Date"
                                value={fromDate}
                                minDate={new Date(new Date().setDate(new Date().getDate() - 30))}
                                maxDate={toDate}
                                onChange={(newDate: Date) => handleFromDateChange(newDate)}
                                slotProps={{ textField: { variant: 'outlined', disabled: true } }}
                            />
                            <DatePicker
                                label="To Date"
                                value={toDate}
                                minDate={fromDate}
                                maxDate={new Date()}
                                onChange={(newDate: Date) => handleToDateChange(newDate)}
                                slotProps={{ textField: { variant: 'outlined', disabled: true } }}
                            />
                        </LocalizationProvider>

                        <div className='flex flex-center-gap'>
                            <div>
                                <button
                                    disabled={!selectedVehicles.length}
                                    onClick={(event: any) => {
                                        setAnchorEl(event.currentTarget);
                                        setReportType('summarized');
                                    }}
                                    className='apply-btn flex flex-center-gap'
                                >
                                    <Icon sx={{ fontSize: 'inherit', color: 'inherit' }}>download</Icon>Fleet Utilization Report
                                </button>
                            </div>
                            <div>
                                <button
                                    disabled={!selectedVehicles.length}
                                    onClick={(event) => {
                                        setAnchorEl(event.currentTarget);
                                        setReportType('charging');
                                    }}
                                    className='apply-btn flex flex-center-gap'
                                >
                                    <Icon sx={{ fontSize: 'inherit', color: 'inherit' }}>download</Icon>Charging Report
                                </button>
                            </div>
                            <div>
                                <button
                                    disabled={!selectedVehicles.length}
                                    onClick={(event) => {
                                        setAnchorEl(event.currentTarget);
                                        setReportType('trip');
                                    }}
                                    className='apply-btn flex flex-center-gap'
                                >
                                    <Icon sx={{ fontSize: 'inherit', color: 'inherit' }}>download</Icon>Trip Report
                                </button>
                            </div>
                            {anchorEl && renderMenuContent()}
                        </div>
                    </div>
                    {
                        reportData && <div className='flex flex-justify-end'>
                            <div>
                                {
                                    error.isError && <Tooltip title={error.message} placement='top'>
                                        <IconButton size="large">
                                            <Icon className='material-symbols-outlined' sx={{ fontSize: 'inherit' }}>warning_amber</Icon>
                                        </IconButton>
                                    </Tooltip>
                                }
                                <Tooltip title={info} placement='top'>
                                    <IconButton size="large">
                                        <Icon className='material-symbols-outlined' sx={{ fontSize: 'inherit' }}>info</Icon>
                                    </IconButton>
                                </Tooltip>
                            </div>
                        </div>
                    }
                    {
                        loader?.table || !filteredReportData
                            ? <Loader type={LOADER_TYPE.FULL_PAGE} />
                            : filteredReportData && <div className='reports-container'>
                                <table className='table'>
                                    <thead>
                                        <tr>
                                            {
                                                filteredReportData?.headers && Object.entries(filteredReportData?.headers)?.map(([key, value]: [any, any]) => {
                                                    return <th className='cursor-pointer' key={key} onClick={() => sortTable(value?.order - 1)}>
                                                        <div className='flex flex-evenly'>
                                                            <span>
                                                                {value?.display_name}
                                                                {
                                                                    (value?.unit[0] && value?.unit[1]) && <><br />{value?.unit[0]}</>
                                                                }
                                                            </span>
                                                            {
                                                                filter.column === (value?.order - 1) && (
                                                                    filter.type === 'asc'
                                                                        ? <Icon className='material-symbols-outlined' sx={{ fontSize: 'inherit' }}>arrow_drop_up</Icon>
                                                                        : <Icon className='material-symbols-outlined' sx={{ fontSize: 'inherit' }}>arrow_drop_down</Icon>
                                                                )
                                                            }
                                                        </div>
                                                    </th>
                                                })
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            filteredReportData?.data?.map((row: any, rowKey: any) => (
                                                <tr key={rowKey}>
                                                    {
                                                        row?.map((column: any, columnKey: any) => {
                                                            return <td key={row[0] + columnKey}>
                                                                {
                                                                    filteredReportData?.headers?.[reportHeaderKey[columnKey]]?.unit[0]?.includes('Minute')
                                                                        ? formatTimeWithDHM(column)
                                                                        : column
                                                                }
                                                            </td>
                                                        })
                                                    }
                                                </tr>
                                            ))

                                        }
                                    </tbody>
                                </table>
                                {!filteredReportData?.data?.length && <div className='flex flex-center flex-center-gap flex-justify-center standard-padding'>No Data for selected vehicle/s</div>}
                            </div>
                    }
                </div>
        }
    </>;
};

export default Reports;
