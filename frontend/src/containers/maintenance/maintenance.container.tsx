import React from "react";
import Sidebar, { SidebarProps } from "../../components/shared/sidebar/sidebar.container";
import Map from "../../components/shared/map/map.container";
import AppPath from "../../AppPath.constants";

const MaintenanceContainer = () => {
	const sidebar: Partial<SidebarProps> = {
		backlink: AppPath.MAINTENANCE,
		title: {
			show: true,
			text: 'Maintenance'
		},
		button: {
			text: 'Action',
			action: () => console.log('action click')
		}
	};

	return (
		<div className={'ev-sidebar-map-container'}>
			<Sidebar {...sidebar} />
			<Map />
		</div>
	);
}

export default MaintenanceContainer;
