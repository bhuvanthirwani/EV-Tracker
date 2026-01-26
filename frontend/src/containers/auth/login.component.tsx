import React, {
	useEffect,
	useState
} from 'react';
import { postRequest } from '../../api-service';
import Loader from '../../components/shared/loader/loader.component';
import LOADER_TYPE from '../../loader.constant';
import { setLocalStoreItem } from '../../utils';
import API from './../../API_ENDPOINTS.constant';
import './login.component.css';

import {
	Visibility,
	VisibilityOff
} from '@mui/icons-material';
import {
	IconButton,
	InputAdornment,
	TextField
} from '@mui/material';

import { Paper, Box, Typography } from '@mui/material';
// import { Link } from 'react-router-dom';
import AppPath from '../../AppPath.constants';
// @ts-ignore
import evLogo from '../../assets/images/ev-tracker-logo.png';
import getAppVersion from '../../utils/version.util';

const Login = () => {
	const [email, updateEmail] = useState('');

	const [password, updatePassword] = useState('');

	const [formError, updateFormError] = useState({ message: '', isError: false });

	const [loader, updateLoader] = useState(false);

	// const EMAIL_RULE = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

	useEffect(() => {
		updateFormError(formError);
	}, [formError]);

	const handleEmailInput = (event: any) => {
		// if (!EMAIL_RULE.test(event.target.value)) {
		// 	updateFormError({message: 'Please enter valid email', isError: true});
		// } else {
		// 	updateFormError({message: '', isError: false});
		// }

		updateEmail(event.target.value);
		if (password.length >= 4 && formError.isError) {
			updateFormError({ message: '', isError: false });
		}
	}

	const handlePasswordInput = (event: any) => {
		if (event.target.value.length < 4) {
			updatePassword(event.target.value);
			updateFormError({ message: 'Please enter password (min 4 characters)', isError: true });
		} else {
			updatePassword(event.target.value);
			updateFormError({ message: '', isError: false });
		}
	}

	const [showPassword, setShowPassword] = useState(false);

	const handlePasswordToggle = () => {
		setShowPassword(prev => !prev);
	}

	const handleLogin = async () => {
		if (email && password) {
			updateLoader(true);

			await postRequest(
				API.LOGIN,
				{
					user_key: email,
					password: password
				}
			).then((response) => {
				if (response?.status === 200 && response?.data?.token) {
					setLocalStoreItem('auth', response.data.token);
					setLocalStoreItem('user', JSON.stringify(response.data));
					setLocalStoreItem('user_id', getUserIdFromToken(response.data.token));
					updateLoader(false);
					location.replace(AppPath.DASHBOARD);
				} else {
					updateLoader(false);
				}
			}).catch((error: any) => {
				updateLoader(false);
				updateFormError({ message: error?.response?.data?.error || error?.message, isError: true });
				setTimeout(() => {
					updateFormError({ message: '', isError: false });
				}, 5000);
			});
		}
	}

	const getUserIdFromToken = (token: string) => {
		if (token) {
			return JSON.parse(atob(token.split('.')[1])).user_id;
		}
	}

	return (
		<div className="login-wrapper">
			<div className="login-left-panel">
				<div className="login-header">
					<img src={evLogo} alt="Tesla" className="login-logo" />
					<h1 className="login-heading">Welcome Back</h1>
					<p className="login-subheading">Please enter your details to sign in</p>
				</div>

				<form className="login-form" autoComplete="on" onSubmit={event => event.preventDefault()}>
					<div className="form-group">
						<TextField
							id="email"
							label="Email or Phone"
							variant="outlined"
							fullWidth
							value={email}
							onChange={handleEmailInput}
							autoComplete="username"
							placeholder="Enter your email or phone"
							InputProps={{
								classes: { root: 'custom-input-root' }
							}}
						/>
					</div>

					<div className="form-group">
						<TextField
							id="password"
							label="Password"
							variant="outlined"
							fullWidth
							type={showPassword ? 'text' : 'password'}
							value={password}
							onChange={handlePasswordInput}
							autoComplete="current-password"
							placeholder="Enter your password"
							InputProps={{
								endAdornment: (
									<InputAdornment position="end">
										<IconButton onClick={handlePasswordToggle} edge="end">
											{showPassword ? <Visibility /> : <VisibilityOff />}
										</IconButton>
									</InputAdornment>
								),
								classes: { root: 'custom-input-root' }
							}}
						/>
					</div>

					{formError?.isError && (
						<div className="error-message">{formError.message}</div>
					)}

					<div className="form-actions">
						{loader ? (
							<Loader type={LOADER_TYPE.FULL_PAGE} />
						) : (
							<button
								type="submit"
								className="login-button"
								disabled={formError?.isError || !email || !password}
								onClick={handleLogin}
							>
								Sign In
							</button>
						)}
						<Paper elevation={0} sx={{ mt: 3, p: 2, bgcolor: '#1a1a1a', borderRadius: 2, border: '1px solid rgba(0, 0, 0, 0.1)' }}>
							<Typography variant="caption" display="block" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
								Demo Credentials
							</Typography>
							<Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
								<Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Email:</Typography>
								<Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>test@example.com</Typography>
							</Box>
							<Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
								<Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>Password:</Typography>
								<Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>password123</Typography>
							</Box>
						</Paper>
					</div>

					<div className="login-footer">
						{/* <Link to={AppPath.PRIVACY_POLICY} className="footer-link">Privacy Policy</Link>
						<span className="footer-separator">•</span>
						<Link to={AppPath.TERMS_AND_CONDITIONS} className="footer-link">Terms</Link>
						<span className="footer-separator">•</span> */}
						<span className="app-version">{getAppVersion()}</span>
					</div>
				</form>
			</div>

			<div className="login-right-panel">
				<div className="image-overlay">
					<h2>EV Tracker</h2>
					<p>Track your EVs</p>
				</div>
			</div>
		</div>
	);
}

export default Login;
