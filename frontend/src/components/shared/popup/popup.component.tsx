import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';

export interface PopupProps {
	title: string;
	open: boolean;
	onClose: (value?: any) => void;
	content?: any;
	styling?: string;
	cancelButton?: {
		text?: string;
		action?: () => any;
	} | undefined,
	applyButton?: {
		text?: string;
		action?: (value: any) => any;
		disabled?: boolean
	} | undefined,
}

const Popup = (props: PopupProps) => {
	const { open, onClose, styling, content, title, cancelButton, applyButton } = props;

	const handleClose = (value?: any) => {
		if (value) {
			onClose(value);
		} else {
			onClose(false);
		}
	}

	return (
		<Dialog onClose={() => handleClose(false)} open={open} className={styling}>
			<DialogTitle className={'dialog-title'}>{title}</DialogTitle>
			<DialogContent>
				<div className={'flex flex-center-gap'} style={{ padding: '16px 8px' }}>{content}</div>
				<DialogActions className={'flex flex-between'}>
					{
						cancelButton
						// @ts-ignore
						&& <button className={'cancel-btn'} onClick={() => cancelButton?.action(false) || handleClose(false)}>{cancelButton?.text || 'Cancel'}</button>
					}
					{
						applyButton
						// @ts-ignore
						&& <button disabled={applyButton?.disabled} className={'apply-btn'} onClick={() => applyButton?.action(true) || handleClose(true)}>{applyButton?.text || 'Apply'}</button>
					}
				</DialogActions>
			</DialogContent>
		</Dialog>
	);
}

export default Popup;
