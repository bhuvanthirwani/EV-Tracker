import React from 'react';
import './live-update-sharing.component.css';
import './../../../../../src/stylesheet.css'
// @ts-ignore
import logo from './../../../../assets/images/ev-tracker-logo-full.png';

const ExpiredPageComponent = () => {
	return (
		<div className='width-100'>
			<div style={{ placeContent: 'end' }} className='banner'>
				<img alt='Tesla Logo' src={logo} className='standard-padding' style={{ maxHeight: '40px' }} />
			</div>

			<div className='expired_container'>
				<img alt='link expired' src='./../../../../../public/assets/link-expired.svg' />
				<div style={{ maxWidth: '32%' }}>
					<h1>Time's up</h1>
					<h1>The Link has Expired!</h1>
					<h4 className='grey-text'>The vehicle location link is no longer active. Please ask the owner to share a new one.</h4>
				</div>
			</div>
		</div>
	);
}

export default ExpiredPageComponent;
