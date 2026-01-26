import React, { useState, useEffect } from "react";
import './user-support.css';
import { TextField, Divider, Autocomplete } from "@mui/material";
import { getLocalStoreItem, setLocalStoreItem } from "../../../utils";
import CallIcon from '@mui/icons-material/Call';
import EmailIcon from '@mui/icons-material/Email';
// @ts-ignore
import address from '../../../assets/images/address-icon.svg';
import UserService from '../../../services/user.service';
import VehicleUtility from "../../../utils/vehicle.utility";
import teslaFront from '../../../assets/images/tesla-vehicle-front.png';

const UserSupport = () => {
	const storedUser = getLocalStoreItem('user');
	const currentUser = storedUser ? JSON.parse(storedUser) : null;

	const storedVehicle = getLocalStoreItem('userVehicles');
	const [vehicleList, updateVehicleList] = useState(storedVehicle ? JSON.parse(storedVehicle) : null);

	const [formData, updateFormData] = useState({
		fullName: currentUser?.full_name,
		phoneNumber: currentUser?.phone,
		email: currentUser?.email,
		vehicleId: '',
		message: ''
	});

	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (!vehicleList) {
			(async () => {
				const userVehicles = await UserService.getUserById();
				updateVehicleList(userVehicles);
				setLocalStoreItem('userVehicles', JSON.stringify(userVehicles));
			})();
		}
	}, []);

	// API Needed
	const handleContactUsSubmission = async (event: any) => {
		event.preventDefault();
		setIsSubmitting(true);
		// Simulate API call
		await new Promise(resolve => setTimeout(resolve, 2000));
		setIsSubmitting(false);
	};

	const handleVehicleIdChange = (event: any, value: string) => {
		updateFormData({ ...formData, vehicleId: value });
	}

	return (
		<div className="support-wrapper fade-in" style={{ display: 'flex', gap: '2rem', padding: '2rem', flexWrap: 'wrap', justifyContent: 'center' }}>

			{/* Left Column: Contact Info */}
			<div className="company-details fade-in-left hover-lift transition-all" style={{ flex: '1', minWidth: '300px', maxWidth: '400px', background: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--box-shadow)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
				<div className="sidebar-img-wrapper flex flex-justify-center" style={{ marginBottom: '1.5rem' }}>
					<img src={teslaFront} alt="Tesla" style={{ maxWidth: '100%', height: 'auto', maxHeight: '150px' }} />
				</div>

				{/* <div className="company-details-name" style={{ marginBottom: '2rem' }}>
					<h2 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>Tesla</h2>
					<a href="https://tesla.com" target='_blank' rel="noreferrer" style={{ color: 'var(--active)', textDecoration: 'none', fontWeight: 500 }}>https://tesla.com</a>
				</div> */}

				<Divider style={{ width: '100%', marginBottom: '1.5rem' }} />

				<div className="company-contact-info flex flex-column-vert-center" style={{ gap: '1rem', width: '100%' }}>
					<div className="contact-item flex flex-center-gap hover-scale transition-all" style={{ background: 'var(--card-background)', padding: '1rem', borderRadius: '8px', width: '100%', cursor: 'pointer' }}>
						<CallIcon sx={{ color: 'var(--active)' }} className="transition-transform" />
						<a rel="noreferer noredirect" href="tel:180012381238" style={{ color: 'var(--text-color)', textDecoration: 'none', fontWeight: 600 }}>1800 1238 1238</a>
					</div>
					<div className="contact-item flex flex-center-gap hover-scale transition-all" style={{ background: 'var(--card-background)', padding: '1rem', borderRadius: '8px', width: '100%', cursor: 'pointer' }}>
						<EmailIcon sx={{ color: 'var(--active)' }} className="transition-transform" />
						<a rel="noreferer noredirect" href="mailto:customer.support@tesla.com" style={{ color: 'var(--text-color)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>customer.support@tesla.com</a>
					</div>
				</div>
			</div>

			{/* Right Column: Contact Form */}
			<div className="contact-form-wrapper fade-in-right" style={{ flex: '2', minWidth: '300px', maxWidth: '600px', background: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: 'var(--box-shadow)' }}>
				<h1 className="fade-in-down" style={{ marginTop: 0, marginBottom: '2rem', color: 'white' }}>Contact Us</h1>
				<form className="flex flex-column-vert-center" style={{ gap: '1.5rem' }}>
					<Autocomplete
						sx={{ width: '100%' }}
						onChange={handleVehicleIdChange}
						size="medium"
						options={vehicleList ? vehicleList.map((vehicle: any) => VehicleUtility.readRegistrationNumber(vehicle)) : []}
						renderInput={(params) =>
							<TextField
								{...params}
								label='Select Vehicle ID'
								variant="outlined"
							/>
						}
					/>

					<div className="flex flex-center-gap" style={{ width: '100%', gap: '1.5rem' }}>
						<TextField
							label="Name"
							variant="outlined"
							fullWidth
							value={formData.fullName}
							onChange={(event) => updateFormData({ ...formData, fullName: event.target.value })}
						/>
						<TextField
							label="Mobile"
							variant="outlined"
							fullWidth
							value={formData.phoneNumber}
							onChange={(event) => updateFormData({ ...formData, phoneNumber: event.target.value })}
						/>
					</div>

					<TextField
						label="Email"
						variant="outlined"
						fullWidth
						value={formData.email}
						onChange={(event) => updateFormData({ ...formData, email: event.target.value })}
					/>

					<TextField
						label="Message"
						variant="outlined"
						multiline
						rows={4}
						fullWidth
						value={formData.message}
						onChange={(event) => updateFormData({ ...formData, message: event.target.value })}
					/>

					<button
						className={`apply-btn transition-all ${isSubmitting ? 'opacity-50' : 'hover-lift'}`}
						onClick={handleContactUsSubmission}
						disabled={isSubmitting}
						style={{ marginTop: '1rem', padding: '12px 32px', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}
					>
						{isSubmitting ? (
							<>
								<span className="loading-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
								Submitting...
							</>
						) : 'Submit Request'}
					</button>
				</form>
			</div>
		</div>
	);
}

export default UserSupport;
