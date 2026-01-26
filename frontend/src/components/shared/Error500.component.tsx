import React, { useState, useEffect } from 'react';
// @ts-ignore
import error500 from '../../assets/images/error-500.svg';

const Error500 = () => {

	const [errorMessage, setErrorMessage] = useState<any>("");

	useEffect(() => {
		setErrorMessage(localStorage.getItem('error_message'));
		localStorage.removeItem('error_message');
	}, []);

	return (
		<div className={'flex flex-center flex-column-vert-center'} style={{ flex: 1 }}>
			<img alt={'500.svg'} src={error500} />
			<h3>
				{
					errorMessage ? errorMessage : 'Something went wrong!'
				}
			</h3>
		</div>
	);
}

export default Error500;
