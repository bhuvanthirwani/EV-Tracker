import React from 'react';
import { Drawer } from '@mui/material';
import './drawer.component.css';

export interface DrawerProps {
	open: boolean;
	onClose: () => void;
	content: any;
}

const DrawerComponent = (props: Partial<DrawerProps>) => {
	const { open, onClose, content } = props;

	return (
		<Drawer
			open={open}
			onClose={onClose}
			anchor={'right'}
			sx={{
				width: '26vw',
				flexShrink: 0,
				['& .MuiDrawer-paper']: { width: '26vw', boxSizing: 'border-box', height: '100vh' },
			}}
		>
			{content}
		</Drawer>
	);
}

export default DrawerComponent;
