import React from 'react';
import {Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import './estimate-popup.component.css';
import {formatTiming} from '../../../../../utils/date.utils';

export interface DialogProps {
	open: boolean;
	onClose: (value: any) => void;
	data: any,
	styling?: string
}

const EstimatePopup = (props: DialogProps) => {
	const {open, onClose, data, styling} = props;

	const handleClose = () => {
		onClose(false);
	}

	return (
		<Dialog onClose={handleClose} open={open} className={styling}>
			<DialogTitle className={'dialog-title'}>Estimated Rates</DialogTitle>
			<DialogContent>
				{
					data && Object.entries(data).map(([key, value]: [string, number]) => {
						return <div className={'values'} key={key}>
							<span className={'key'}>{key.split('_').join(' ')}: </span>
							<span className={'value'}>{key.includes('price') && 'INR'} {key.includes('time') ? formatTiming(value * 60) : value?.toFixed(2)} {key.includes('percentage') && '%'}</span>
						</div>
					})
				}
				<DialogActions>
					<button onClick={handleClose}>Okay, Got It</button>
				</DialogActions>
			</DialogContent>
		</Dialog>
	);
}

export default EstimatePopup;
