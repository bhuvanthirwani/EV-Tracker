import { FormControl, Input } from '@mui/material';
import { AxiosResponse } from 'axios';
import React, { forwardRef, useContext, useImperativeHandle, useState } from 'react';
import { VEHICLE_COMMANDS } from '../../../../../../API_ENDPOINTS.constant';
import { SnackbarContext } from '../../../../../../App';
import { postRequest } from '../../../../../../api-service';
import VehicleUtility from '../../../../../../utils/vehicle.utility';
import { VehicleActions } from '../../vehicle-analytics.constants';

interface TriggerCommandRequestType {
	command_type: string;
	chassis_number: string;
}

const LockCommands = Object.freeze({
	LOCK: 'SOFT_IMMOBILIZATION',
	UNLOCK: 'SOFT_MOBILIZATION'
})

const DigitalLock = forwardRef((props: any, ref) => {
	const { vehicle, action } = props;

	const { snackState, setSnackState } = useContext(SnackbarContext);

	const [isConfirmed, updateIsConfirmed] = useState<boolean>(false);

	const vehicleRegNumber = VehicleUtility.readRegistrationNumber(vehicle);

	const getCommandType = (action: string): string => {
		let resp: string = '';

		switch (action) {
			case VehicleActions.LOCK:
				resp = LockCommands.LOCK;
				break;
			case VehicleActions.UNLOCK:
				resp = LockCommands.UNLOCK;
				break;
		}

		return resp;
	}


	const triggerAction = () => {
		if (action) {
			const requestBody: TriggerCommandRequestType = {
				chassis_number: VehicleUtility.readChassisNumber(vehicle),
				command_type: getCommandType(action)
			}
			postRequest(`${VEHICLE_COMMANDS.TRIGGER}`, { ...requestBody }).then((response: AxiosResponse) => {
				setSnackState({
					...snackState,
					open: true,
					severity: response?.data?.success ? 'success' : 'error',
					message: response?.data?.message
				});
			}).catch((error) => {
				console.error(error)
				setSnackState({ ...snackState, open: true, severity: 'error', message: error.toString() });
			});
		}
	}

	useImperativeHandle(ref, () => {
		return {
			action: () => triggerAction(),
			isConfirmed
		};
	});

	return (
		<div className='flex flex-column' style={{lineHeight: 1.5}}>
			<div>Are you sure you want to <strong>{action.toUpperCase()}</strong> the vehicle: <strong>{vehicleRegNumber}</strong></div>
			<div className='sm-font grey-text'>Please type vehicle number <i>(ex: DL51XY1234)</i> below to perform the action.</div>
			<FormControl>
				<Input
					placeholder='DL51XY1234'
					defaultValue={''}
					inputProps={{
						maxLength: 10,
						style: {textTransform: 'uppercase'}
					}}
					onChange={(event: any) => updateIsConfirmed(event.target.value.toUpperCase() === vehicleRegNumber)}
					error={!isConfirmed}
					onPaste={(event: React.ClipboardEvent<HTMLDivElement>) => {event.preventDefault(); return false;}}
				/>
				<div className='error-text'>{!isConfirmed ? 'Registration number does not match': ''}</div>
			</FormControl>
		</div>
	);
})

DigitalLock.displayName = 'DigitalLock';

export default DigitalLock;
