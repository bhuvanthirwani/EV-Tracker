import React, {
	useState
} from 'react';
import {
	Link,
	NavLink
} from 'react-router-dom';
import Icon from '@mui/material/Icon';
import {
	Box,
	CSSObject,
	Divider,
	List,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	Menu,
	MenuItem,
	styled,
	Theme,
	Toolbar
} from '@mui/material';
import MuiDrawer from '@mui/material/Drawer';
// import {
// 	ChevronLeft,
// 	ChevronRight,
// } from '@mui/icons-material';

// @ts-ignore
import logo from '../../../assets/images/app-logo.png';
import './header.component.css';
import { getLocalStoreItem } from '../../../utils';
import AppPath from '../../../AppPath.constants';
import HeaderRoutes from './header.routes';
import getAppVersion from '../../../utils/version.util';

const drawerWidth = 'var(--drawer-width)';
const openedMixin = (theme: Theme): CSSObject => ({
	width: drawerWidth,
	transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.easeOut,
		duration: theme.transitions.duration.enteringScreen
	}),
	overflowX: 'hidden',
	background: 'var(--background)'
});

const closedMixin = (theme: Theme): CSSObject => ({
	transition: theme.transitions.create('width', {
		easing: theme.transitions.easing.easeIn,
		duration: theme.transitions.duration.leavingScreen
	}),
	overflowX: 'hidden',
	width: `calc(${theme.spacing(7)} + 1px)`,
	[theme.breakpoints.up('sm')]: {
		width: `calc(${theme.spacing(8)} + 1px)`
	}
});

const Drawer = styled(MuiDrawer, {
	shouldForwardProp: (prop) => prop !== 'open'
})(({ theme, open }) => ({
	width: drawerWidth,
	flexShrink: 0,
	whiteSpace: 'nowrap',
	boxSizing: 'border-box',
	...(open && {
		...openedMixin(theme),
		'& .MuiDrawer-paper': openedMixin(theme)
	}),
	...(!open && {
		...closedMixin(theme),
		'& .MuiDrawer-paper': closedMixin(theme)
	})
}));

const Header = () => {
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
	const handleClose = () => {
		setAnchorEl(null);
	}

	const handleLogout = () => {
		localStorage.clear();
		location.replace(AppPath.LOGIN);
	}

	const getGravatar = () => {
		let gravatar = 'JD';
		if (user) {
			let fullName = user?.full_name?.split(' ');
			if (fullName.length === 1) {
				gravatar = fullName[fullName.length - 1].slice(0, 1);
			} else {
				gravatar = fullName[0].slice(0, 1) + fullName[1].slice(0, 1);
			}
		}

		return gravatar;
	}

	const storedUser = getLocalStoreItem('user');
	const user = storedUser ? JSON.parse(storedUser) : null;

	const languagePopUp = () => { };

	const [drawerState] = useState(true);

	// const handleDrawerClose = (event?: any) => setDrawerState(false);
	// const handleDrawerOpen = () => setDrawerState(true);

	// const [notificationCount, setNotificationCount] = useState<any>(null);

	// const getNotificationCount = async () => {
	// 	const response = await getRequest(
	// 		API.NOTIFICATIONS,
	// 		{
	// 			_from: new Date(new Date().setHours(0, 0, 0)),
	// 			_to: new Date(),
	// 		}
	// 	);
	// 	if (response?.data) {
	// 		setNotificationCount(response?.data?.length);
	// 	}
	// }

	// // @ts-ignore
	// useEffect(() => {
	// 	if (!(location.pathname.includes('live') || location.pathname.includes('expired') || location.pathname.includes('login')) && user) {
	// 		getNotificationCount();

	// 		const interval = setInterval(() => {
	// 			getNotificationCount();
	// 		}, 10 * 60 * 1000);

	// 		return () => clearInterval(interval);
	// 	}
	// }, []);

	return (
		<>
			{
				location.pathname.includes('live') || location.pathname.includes('expired')
					? <></>
					: (
						<>
							<Box
								sx={{ display: 'flex' }}
							>
								<Drawer open={drawerState} variant={'permanent'} className={'header'}>
									<Toolbar className={`branding flex flex-justify-center ${!drawerState ? 'close' : ''}`}>
										<img alt="ev logo" src={logo} style={{ height: '40px' }} />
										{
											<strong>Tesla</strong>
										}
									</Toolbar>

									<Divider />

									<List className={'routes'}>
										{
											HeaderRoutes.map((route: any) => (
												<NavLink
													title={route.title}
													activeClassName={'active'}
													isActive={match => {
														if (location.pathname.split('/').includes(route.path.split('/')?.[1])) {
															return true;
														}
														return false;
													}}
													exact
													to={route.path}
													key={route.key}
												// onClick={handleDrawerClose}
												>
													<ListItemButton className="transition-all hover-lift">
														<ListItemIcon className="transition-transform">
															{route?.icon?.content}
															{/* {
																route?.key?.includes('notification')
																	? <Badge
																		badgeContent={notificationCount}
																		showZero
																		color={"error"}
																		style={{ position: 'absolute', top: '10px', right: '10px' }}
																	/>
																	: null
															} */}
														</ListItemIcon>
														<ListItemText >
															{route?.img ? <img {...route?.img} alt={route?.key} /> : route?.title}
														</ListItemText>
													</ListItemButton>
												</NavLink>
											))
										}
									</List>

									<List className={'user-profile-item'}>
										<ListItemButton className="transition-all hover-lift">
											<div
												className={'flex flex-center-gap cursor-pointer'}
												aria-controls="basic-menu"
												aria-haspopup="true"
												aria-expanded={open ? true : undefined}
												onClick={handleClick}
											>
												<ListItemIcon>
													<div className="user-img">{user?.profile_picture ? <img src={user?.profile_picture} alt={user?.full_name} /> : getGravatar()}</div>
												</ListItemIcon>

												<ListItemText
													className="username"
													title={user?.full_name || 'John Doe'}
												>
													{user?.full_name || 'John Doe'}
												</ListItemText>
											</div>
										</ListItemButton>

										<Menu
											anchorEl={anchorEl}
											open={open}
											onClose={handleClose}
											onClick={handleClose}
											MenuListProps={{
												'aria-labelledby': 'basic-button',
											}}
										>
											<MenuItem title={'Vehicle Details'}>
												<Link to={AppPath.USER + AppPath.USER_VEHICLES_LIST}>
													<Icon className='material-symbols-outlined'>local_shipping</Icon>Vehicle Details
												</Link>
											</MenuItem>
											<MenuItem title={'Support'}>
												<Link to={AppPath.USER + AppPath.USER_SUPPORT}>
													<Icon className='material-symbols-outlined'>support_agent</Icon>Support/Feedback
												</Link>
											</MenuItem>
											<MenuItem sx={{ display: 'none' }} title={'Language'} onClick={languagePopUp}>
												<Icon className='material-symbols-outlined'>language</Icon>Language
											</MenuItem>
											<Divider />
											{/* <MenuItem title={'Terms & Conditions'} className='sm-font' style={{justifyContent: 'center'}}>
								<Link to={AppPath.TERMS_AND_CONDITIONS}>
									Terms & Conditions
								</Link>
							</MenuItem> */}
											<MenuItem title={'Logout'} className={'logout'} onClick={handleLogout}>Logout</MenuItem>
										</Menu>

										<Divider />

										<div className={`flex drawer-toggle open`} style={{ display: 'none' }}>
											{/* Drawer toggle removed to keep sidebar persistent */}
										</div>
										<Divider />
										<MenuItem className='flex flex-justify-center app-version xxs-font' style={{ gap: 20 }}>
											<div>{getAppVersion()}</div>
											<div>|</div>
											<Link to={AppPath.PRIVACY_POLICY}>Privacy</Link>
											<div>|</div>
											<Link to={AppPath.TERMS_AND_CONDITIONS}>Terms</Link>
										</MenuItem>
									</List>
								</Drawer>
							</Box>
						</>
					)
			}
		</>
	);
}

export default Header;
