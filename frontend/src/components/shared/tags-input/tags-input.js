import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Chip, TextField, Select, MenuItem, ListItemText, Checkbox, OutlinedInput, InputLabel } from '@mui/material';
import Downshift from "downshift";
import { isValidEmail } from "../../../utils";
import './tags-input.style.css';


const TagsInput = ({ ...props }) => {
	const { selectedTags, placeholder, tags, defaultValue, drop_down_obj, dropdownSelect, ...other } = props;
	const [inputValue, setInputValue] = useState("");
	const [dropDownVal, setDropDownVal] = useState([]);
	const [selectedItem, setSelectedItem] = useState([]);

	const show_drop_down = drop_down_obj?.to_show && (drop_down_obj?.values || []).length > 0


	useEffect(() => {
		setSelectedItem(tags?.length ? tags : defaultValue);
	}, [tags]);

	useEffect(() => {
		selectedTags(selectedItem);
	}, [selectedItem, selectedTags]);

	const handleKeyDown = (event) => {
		if (event.key === "Enter") {
			if (isValidEmail(event?.target?.value)) {
				const newSelectedItem = [...selectedItem];
				const duplicatedValues = newSelectedItem.includes(event?.target?.value?.trim());

				if (duplicatedValues) {
					setInputValue('');
					return;
				}

				if (!event.target.value.replace(/\s/g, "").length) {
					return;
				}

				newSelectedItem.push(event?.target?.value?.trim());
				setSelectedItem(newSelectedItem);
				setInputValue('');
			}
		}
		if (
			selectedItem.length &&
			!inputValue.length &&
			event.key === "Backspace"
		) {
			setSelectedItem(selectedItem.slice(0, selectedItem.length - 1));
		}
	}

	const handleChange = (item) => {
		let newSelectedItem = [...selectedItem];
		if (!newSelectedItem.includes(item)) {
			newSelectedItem = [...newSelectedItem, item];
		}
		setInputValue('');
		setSelectedItem(newSelectedItem);
	}

	const handleDelete = (item) => () => {
		const newSelectedItem = [...selectedItem];
		newSelectedItem.splice(newSelectedItem.indexOf(item), 1);
		setSelectedItem(newSelectedItem);
	};

	const handleInputChange = (event) => {
		setInputValue(event.target.value);
	}
	const handleChangeDropDown = (event) => {
		const newList = [...event.target.value]
		setDropDownVal(newList)
		dropdownSelect(newList.map(val => drop_down_obj.values[drop_down_obj.list.indexOf(val)]))
	}


	return (
		<Downshift
			inputValue={inputValue}
			onChange={handleChange}
			selectedItem={selectedItem}
		>
			{({ getInputProps }) => {
				const { onBlur, onChange, onFocus, ...inputProps } = getInputProps({
					onKeyDown: handleKeyDown,
					placeholder
				});
				return (
					<div id={'tagsContainer'} style={{ width: '100%' }}>
						<TextField
							variant={'outlined'}
							InputProps={{
								startAdornment: selectedItem.map((item) => (
									<Chip
										key={item}
										tabIndex={-1}
										label={item}
										onDelete={handleDelete(item)}
										style={{ margin: '8px 4px 4px', padding: 4 }}
									/>
								)),
								onBlur,
								onChange: (event) => {
									handleInputChange(event);
									onChange(event);
								},
								onFocus
							}}
							{...inputProps}
							{...other}
						/>


						{show_drop_down ?
							<div>

								<InputLabel id="demo-multiple-checkbox-label">{drop_down_obj.label || 'Select Value'}</InputLabel>
								<Select
									labelId="select-label-report"
									id="select-label-report-id"
									multiple
									value={dropDownVal}
									placeHolder="Select Report Type"
									label=""
									onChange={handleChangeDropDown}
									input={<OutlinedInput label={drop_down_obj.label || 'Select Value'} />}

									renderValue={value => value.join(', ')}
								>
									{drop_down_obj.list.map(val =>
										<MenuItem value={val}>
											<Checkbox checked={dropDownVal.indexOf(val) > -1} />
											<ListItemText primary={val} />
										</MenuItem>)}
								</Select> </div>
							: ''}

					</div>
				);
			}}
		</Downshift>
	);
}
TagsInput.defaultProps = {
	tags: []
};
TagsInput.propTypes = {
	selectedTags: PropTypes.func.isRequired,
	tags: PropTypes.arrayOf(PropTypes.string)
};

export default TagsInput;
