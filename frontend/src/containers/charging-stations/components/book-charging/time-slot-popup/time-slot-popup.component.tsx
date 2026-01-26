import React, {useState} from 'react';
import {Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {DialogProps} from "../estimate-popup/estimate-popup.component";
import Nouislider from "nouislider-react";
import 'nouislider/dist/nouislider.min.css';
import './time-slot-popup.component.css';


const TimeSlotPopup = (props: DialogProps) => {
	const {open, onClose, styling} = props;

	const handleClose = (value?: any) => {
		onClose(value);
	}

	const start = new Date().getMinutes() > 30 ? new Date().getHours() + 1 : new Date().getHours();
	const someRange = [start, start + 2];

	const [isApplyDisable, setApplyDisable] = useState(false);

	const [range, setRange] = useState(someRange);

	const checkValidity = (range: any) => {
		if (start > parseFloat(range[0])) {
			setApplyDisable(true);
		} else {
			setApplyDisable(false);
			setRange(range);
		}
	}

	return (
		<Dialog onClose={handleClose} open={open} className={styling} fullWidth={true}>
			<DialogTitle className={'flex flex-justify-center dialog-title'}>Available Slots</DialogTitle>
			<DialogContent>
				<div className="slider-container">
					<div className="slider">
						<Nouislider
							connect
							range={{
								min: 0,
								max: 24
							}}
							start={someRange}
							animate={true}
							direction={'ltr'}
							orientation={'horizontal'}
							tooltips={true}
							step={0.5}
							pips={{
								mode: 'count',
								density: 13,
								values: 13,
								stepped: true,
							}}
							onSlide={checkValidity}
						/>
					</div>
				</div>

				{
					isApplyDisable && <span className={'error-text flex flex-justify-center'}>Start time must be greater than present time.</span>
				}

				<DialogActions className={'flex flex-between'}>
					<button className={'cancel-btn'} onClick={() => handleClose(false)}>Cancel</button>
					<button className={'apply-btn'} disabled={isApplyDisable} onClick={() => handleClose(range)}>Apply</button>
				</DialogActions>
			</DialogContent>
		</Dialog>
	);
}

export default TimeSlotPopup;
