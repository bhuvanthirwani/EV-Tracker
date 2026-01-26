import AppPath, { VehiclePaths } from '../../../AppPath.constants';
import VehicleUtility from '../../../utils/vehicle.utility'
import { formatDateWithYearAndTime } from '../../../utils/date.utils';
import { getConfig } from '../../../firebase.service';
import { HUB } from '../../../containers/charging-stations/charging-station.interfaces';

const ROUTE_STATUS_CONFIG = getConfig('route_status');

export const VehicleInfoPopUp = (datum: any) => {

    const location = `https://www.google.com/maps/search/?api=1&query=${datum?.location?.coordinate?.latitude}%2C${datum?.location?.coordinate?.longitude}`;
    const routeStatus = ROUTE_STATUS_CONFIG?.[datum?.status?.route];

    const popupData = `
        <div class="vehicle-marker-popup flex flex-column-vert-center">
            <div class="flex flex-between flex-start-gap">
                <div>
                    <span><strong title='Registration Number' class="registration-number">${VehicleUtility.readRegistrationNumber(datum)}</strong> (${datum?.vehicle_meta?.category})</span>
                    <br />
                    <span className="parking">${routeStatus ? routeStatus : ''}</span>
                </div>
                <div class="flex flex-center-gap">
                    <a class="flex sm-font flex-center" href=${location} target="_blank" rel="noopener noreferrer">
                        <span class="material-symbols-outlined sm-font">open_in_new</span><span> Location</span>
                    </a>
                    <span class="material-symbols-outlined sm-font" title="click to copy" onclick="navigator.clipboard.writeText('${location}')">content_copy</span>
                </div>
            </div>
            <div>
                <strong>Battery SOC</strong><span>: ${datum?.battery?.soc ? (datum?.battery?.soc + '%') : '--'}</span>
            </div>
            <div class="flex flex-column-vert-center last-update">
                <strong><u>Last Updated At</u></strong>
                <span><strong>Vehicle:</strong> ${(datum?.lua?.vehicle) ? formatDateWithYearAndTime(datum?.lua?.vehicle) : '--'}</span>
                <span><strong>Location:</strong> ${(datum?.lua?.location) ? formatDateWithYearAndTime(datum?.lua?.location) : '--'}</span>
            </div>
            <div class="internal-links flex flex-justify-center flex-center-gap">
                <a class="flex flex-center flex-justify-center sm-font" href=${VehiclePaths.ANALYTICS}/${VehicleUtility.readIMEI(datum)}>
                    <span>Live View</span><span class="material-symbols-outlined">open_in_new</span>
                </a>
                <a class="flex flex-center flex-justify-center sm-font" href=${VehiclePaths.RIDES}/${VehicleUtility.readIMEI(datum)}>
                    <span>Rides</span><span class="material-symbols-outlined">open_in_new</span>
                </a>
                ${
                    datum?.battery?.soc < 20
                    ? (`<a class="flex flex-center flex-justify-center sm-font" href=${AppPath.BOOKING}>
                            <span>Book Charging</span><span class="material-symbols-outlined">open_in_new</span>
                        </a>`
                    )
                    : ''
                }
            </div>
        </div>
    `;

    return popupData;
}

export const ChargerInfoPopup = (hub: HUB | any) => {

    const location = `https://www.google.com/maps/search/?api=1&query=${hub?.location?.latitude}%2C${hub?.location?.longitude}`;

    const popupData = `
        <div class="vehicle-marker-popup flex flex-column-vert-center">
            <div class="grid">
                <div><strong title=${hub.hub_name} class="active-text">${hub.hub_name}</strong></div>
                <div><strong class="registration-number">${hub?.distance} kms away</strong></div>
            </div>
            <div class="flex flex-center-gap">
                <a class="flex sm-font flex-center" href=${location} target="_blank" rel="noopener noreferrer">
                    <span class="material-icons sm-font">open_in_new</span><span> Navigate using Google Maps</span>
                </a>
                <span class="material-icons sm-font cursor-pointer" title="click to copy" onclick="navigator.clipboard.writeText('${location}')">content_copy</span>
            </div>
            <div class="flex flex-column-vert-center last-update">
                <strong><u>Last Updated At</u></strong>
                <span>${(hub?.last_updated_at) ? formatDateWithYearAndTime(hub?.last_updated_at) : '--'}</span>
            </div>
        </div>
    `;

    return popupData;
}


