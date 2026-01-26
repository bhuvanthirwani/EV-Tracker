import { MenuItem, TextField } from "@mui/material";
import React, { useState } from "react";
import Popup from "../../../components/shared/popup/popup.component";
import './add-vehicle.css';

const AddVehicle = (props: any) => {
    const { popupState, updatePopupState } = props;

    const [newVehicleData, updateNewVehicleData] = useState<any>({
        vehicleNumber: '',
        driverName: '',
        vehicleType: 'Self Drive',
        companyName: 'TESLA'
    });

    const renderContent = () => {
        return (
            <div className="input-control flex flex-column-vert-center">
                <div className="form-wrapper flex flex-column-vert-center">
                    <div className="flex">
                        <TextField
                            required
                            variant="outlined"
                            label='Vehicle Number'
                            value={newVehicleData?.vehicleNumber}
                            onChange={(event) => updateNewVehicleData({ ...newVehicleData, vehicleNumber: event?.target?.value })}
                        />
                        <TextField
                            required
                            variant="outlined"
                            label='Driver Name'
                            value={newVehicleData?.driverName}
                            onChange={(event) => updateNewVehicleData({ ...newVehicleData, driverName: event?.target?.value })}
                        />
                    </div>
                    <div className="flex">
                        <TextField
                            select
                            required
                            label='Vehicle Type'
                            value={newVehicleData?.vehicleType}
                            onChange={(event) => updateNewVehicleData({ ...newVehicleData, vehicleType: event?.target?.value })}
                        >
                            <MenuItem value="Rented from" key="Rented from">Rented from</MenuItem>
                            <MenuItem value="Rented to" key="Rented to">Rented to</MenuItem>
                            <MenuItem value="Self Drive" key="Self Drive">Self Drive</MenuItem>
                        </TextField>
                        <TextField
                            select
                            required
                            label='Company Name'
                            value={newVehicleData?.companyName}
                            onChange={(event) => updateNewVehicleData({ ...newVehicleData, companyName: event?.target?.value })}
                        >
                            <MenuItem value="Tesla" key="Tesla">Tesla</MenuItem>
                        </TextField>
                    </div>
                </div>
                <div className="button-wrapper flex">
                    <button className="cancel-btn" onClick={() => updatePopupState(false)}>
                        Cancel
                    </button>
                    <button disabled className="apply-btn">
                        Add
                    </button>
                </div>
            </div>
        );
    }

    return (
        <Popup
            open={popupState}
            onClose={updatePopupState}
            title='ADD NEW VEHICLE'
            content={popupState ? renderContent() : ''}
            styling={'add-vehicle-wrapper'}
        />
    );
};

export default AddVehicle;