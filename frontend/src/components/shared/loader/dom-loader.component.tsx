import React from 'react';
import './loader.component.css';
// @ts-ignore
import loader from './../../../assets/images/loader.svg';

const DOMLoader = () => {
	return (
		<div className={'dom-loader'}>
			<img src={loader} alt=" Loading..." style={{ height: '40px' }} />
			<span>Loading...</span>
		</div>
	)
}

export default DOMLoader;
