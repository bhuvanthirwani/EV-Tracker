import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import { Button, Icon, IconButton } from '@mui/material';

export interface SnackProps {
	open: boolean;
	message: string;
	autoHideDuration?: number;
	anchorOrigin?: {
		horizontal: 'center' | 'left' | 'right',
		vertical: 'bottom' | 'top'
	} | undefined;
	severity: 'success' | 'warning' | 'error' | 'info';
	onClose: (value?: any) => void;
	actionButton?: {
		onclick: (value?: any) => void;
		text: string;
	}
}

const SnackbarComponent = (props: SnackProps) => {
	const {open, autoHideDuration, anchorOrigin, severity, message, onClose, actionButton} = props;

	const handleClose = (value?: any) => {
		if (value) {
			onClose(value);
		} else {
			onClose(false);
		}
	}

	return (
        <Snackbar
			open={open}
			autoHideDuration={autoHideDuration || 3000}
			anchorOrigin={anchorOrigin || {horizontal: 'center', vertical: 'bottom'}}
			className={severity}
			message={message}
			onClose={() => handleClose(false)}
			action={actionButton && <React.Fragment>
				<Button variant='contained' color="primary" size="small" onClick={actionButton?.onclick}>
					{actionButton?.text}
				</Button>
				<IconButton
                    aria-label="close"
                    color="inherit"
                    sx={{ p: 0.5 }}
                    onClick={handleClose}
                    size="large">
					<Icon className='material-symbols-outlined'>close</Icon>
				</IconButton>
			</React.Fragment> || ''}
		/>
    );
}

export default SnackbarComponent;
