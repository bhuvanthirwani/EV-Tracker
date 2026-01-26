import React from 'react';
// @ts-ignore
import loader from '../../../assets/images/loader.svg'
import './loader.component.css';
import LOADER_TYPE from '../../../loader.constant';

const Loader = (props: any) => {
	return (
		<div className={props.type || LOADER_TYPE.FULL_PAGE}>
			<img src={loader} alt={loader} style={{ width: '50px', height: '50px' }} />
			{props.message ? <div>{props.message}</div> : ''}
		</div>
	);
}

export default Loader;
