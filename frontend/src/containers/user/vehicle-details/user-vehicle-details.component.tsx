import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { getLocalStoreItem, setLocalStoreItem } from '../../../utils';
import UserService from '../../../services/user.service';
import { Autocomplete, Divider, Icon, Skeleton, TextField } from '@mui/material';
import VehicleUtility from '../../../utils/vehicle.utility';
import './user-vehicle-details.css';
import { getRequest } from '../../../api-service';
import API from '../../../API_ENDPOINTS.constant';
import AddVehicle from './add-vehicle.component';
import { formatDateWithYear } from '../../../utils/date.utils';
import { getFormattedAddress } from '../../../utils/shared.api';
import VEHICLE from 'src/containers/vehicles/vehicle.interface';
import teslaSide from '../../../assets/images/tesla-vehicle-side.png';

const UserVehicleDetails = () => {
	const storedVehicles = getLocalStoreItem('userVehicles');
	const params: any = useLocation().state;

	const [vehicleList, updateVehicleList] = useState(storedVehicles ? JSON.parse(storedVehicles) : null);
	const [vehicleAddress, updateVehicleAddress] = useState<any>();
	const [popupState, updatePopupState] = useState(false);

	const [vehicleInformation, updateVehicleInformation] = useState<any>();

	const setCurrentVehicle = () => {
		if (params && params?.vehicle_number) {
			return params.vehicle_number;
		} else if (vehicleList && vehicleList?.length) {
			return VehicleUtility.readRegistrationNumber(vehicleList[0]);
		} else {
			return null
		}
	}
	const [currentVehicle, updateCurrentVehicle] = useState<any>(setCurrentVehicle);


	useEffect(() => {
		if (!vehicleList) {
			(async () => {
				const userVehicles = await UserService.getUserById();
				updateVehicleList(userVehicles);
				setLocalStoreItem('userVehicles', JSON.stringify(userVehicles));
				updateCurrentVehicle(userVehicles ? VehicleUtility.readRegistrationNumber(userVehicles[0]) : currentVehicle);
			})();
		}
	}, []);

	useEffect(() => {
		if (currentVehicle && vehicleList) {
			updateVehicleInformation(null);
			updateVehicleAddress(null);
			const selectedVehicle = vehicleList.find((vehicle: object) => VehicleUtility.readRegistrationNumber(vehicle as VEHICLE) === currentVehicle);

			(async () => {
				const vehicleDetails: any = await getRequest(
					API.VEHICLE_STATIC_DETAILS,
					{
						vehicle_id: (selectedVehicle as any)?.id
					}
				);

				const address = await getFormattedAddress(vehicleDetails?.data?.location)
				address ? updateVehicleAddress(address) : updateVehicleAddress('- - -');

				updateVehicleInformation(vehicleDetails?.data);
			})();
		}
	}, [currentVehicle]);

	return (
		<div className="vehicle-details-wrapper flex flex-column-vert-center fade-in" style={{ backdropFilter: 'blur(10px)', background: 'rgba(255, 255, 255, 0.9)', padding: '2rem', borderRadius: 'var(--border-radius)', boxShadow: 'var(--box-shadow)' }}>
			<div className="vehicle-details" style={{ width: '100%', maxWidth: '800px' }}>
				<div className="select-vehicle flex flex-column-vert-center fade-in-stagger-1" style={{ marginBottom: '2rem', width: '100%' }}>
					{
						vehicleList?.length
						&& (
							<div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
								<Autocomplete
									onChange={(event: any, value: string) => updateCurrentVehicle(value)}
									size="small"
									options={vehicleList?.map((vehicle: any) => VehicleUtility.readRegistrationNumber(vehicle as VEHICLE))}
									value={currentVehicle}
									renderInput={(params) =>
										<TextField
											{...params}
											label='Select Vehicle'
											variant="outlined"
											className="transition-all"
											style={{ background: 'white', borderRadius: '4px' }}
										/>
									}
									style={{ width: '100%', maxWidth: '400px' }}
								/>
								<img
									src={teslaSide}
									alt="Tesla"
									className="scale-in"
									style={{ maxHeight: '200px', objectFit: 'contain' }}
								/>
							</div>
						)
					}
				</div>

				<div className="vehicle-info-grid fade-in-stagger-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '100%' }}>
					{/* Vehicle Location Card */}
					<div className="info-card hover-lift transition-all" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
						<div className="flex flex-center-gap" style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>
							<Icon className="transition-transform hover-scale">push_pin</Icon>
							<h3 style={{ margin: 0 }}>Location</h3>
						</div>
						<div className="flex flex-center-gap">
							{
								vehicleAddress
									? <p className="fade-in" style={{ fontSize: '1rem', lineHeight: '1.5' }}>{vehicleAddress}</p>
									: <div style={{ width: '100%' }}>
										<Skeleton variant="text" width="100%" height={24} className="skeleton-pulse" />
										<Skeleton variant="text" width="80%" height={24} className="skeleton-pulse" />
									</div>
							}
						</div>
					</div>

					{/* Vehicle Specs Card */}
					<div className="info-card hover-lift transition-all" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
						<div className="flex flex-center-gap" style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>
							<Icon className="transition-transform hover-scale">electric_rickshaw</Icon>
							<h3 style={{ margin: 0 }}>Specs</h3>
						</div>
						<div className="flex flex-column" style={{ gap: '0.5rem' }}>
							<div className="detail-row flex flex-between transition-colors">
								<strong>Model:</strong> <span>Tesla Model 3</span>
							</div>
							<div className="detail-row flex flex-between transition-colors">
								<strong>Mfg Date:</strong>
								<span>
									{vehicleInformation ? (vehicleInformation?.assembly_date && formatDateWithYear(vehicleInformation?.assembly_date)) : <Skeleton width={100} className="skeleton-pulse" />}
								</span>
							</div>
							<div className="detail-row flex flex-between transition-colors">
								<strong>Chassis:</strong>
								<span>
									{vehicleInformation ? vehicleInformation?.chassis_number : <Skeleton width={100} className="skeleton-pulse" />}
								</span>
							</div>
							<div className="detail-row flex flex-between transition-colors">
								<strong>Firmware:</strong>
								<span>
									{vehicleInformation ? vehicleInformation?.firmware : <Skeleton width={100} className="skeleton-pulse" />}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			<Divider style={{ width: '100%', margin: '2rem 0' }} />

			<div className="user-details-section fade-in-stagger-3" style={{ width: '100%', maxWidth: '800px', background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
				<div className="flex flex-center-gap" style={{ marginBottom: '1rem', color: 'var(--primary-color)' }}>
					<Icon className="transition-transform hover-scale">person</Icon>
					<h3 style={{ margin: 0 }}>Owner Details</h3>
				</div>
				<div className="flex flex-column" style={{ gap: '0.5rem' }}>
					<div className="detail-row flex flex-between transition-colors">
						<strong>Owner Name:</strong>
						<span style={{ fontSize: '1.1rem', fontWeight: 500 }}>
							{vehicleInformation ? vehicleInformation?.owner : <Skeleton width={150} className="skeleton-pulse" />}
						</span>
					</div>
				</div>
			</div>

			<AddVehicle popupState={popupState} updatePopupState={updatePopupState} />
		</div>
	);
}

export default UserVehicleDetails;
