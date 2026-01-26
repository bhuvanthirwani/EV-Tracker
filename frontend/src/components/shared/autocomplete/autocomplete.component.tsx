import React, { useState } from 'react';
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxIconBlank from '@mui/icons-material/CheckBoxOutlineBlank';

export interface EVAutocompleteInterface {
	data: Array<any>,
	defaultValue: Array<any>,
	label: string,
	placeholder: string,
	id: string,
	changeHandler: any,
	optionKey: string,
	group?: boolean,
	isSelectAll?: boolean
}


const EVAutocomplete = (props: EVAutocompleteInterface) => {
	const { id, defaultValue, label, placeholder, changeHandler, optionKey, group, isSelectAll } = props;
	let { data } = props;

	const [value, setValues] = useState<any>([]);

	if (group) {
		data = data.map((option: any) => {
			const firstLetter = option[optionKey].slice(0, 2).toUpperCase();
			return {
				firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
				...option,
			};
		});
	}

	return (
		<Autocomplete
			multiple
			disableCloseOnSelect
			limitTags={2}
			id={id}
			value={value}
			filterOptions={(options, params) => {
				if (isSelectAll) {
					const filter = createFilterOptions()
					const filtered = filter(options, params)
					return [{ title: 'Select all', all: true, label: 'Select All' }, ...filtered]
				} else { return [] }
			}}
			options={group ? data?.sort((o1, o2) => -o2[optionKey].localeCompare(o1[optionKey])) : data}
			groupBy={group ? (option) => option?.firstLetter : (option) => option}
			getOptionLabel={(option) => option?.[optionKey]}
			defaultValue={defaultValue}
			isOptionEqualToValue={(option, value) => option?.[optionKey] === value?.[optionKey]}
			renderInput={(params) => (
				<TextField {...params} label={label} placeholder={placeholder} />
			)}
			renderOption={(props, option, { selected }) => (
				<li {...props}>
					{(isSelectAll && option.all ? !!(value?.length === data.length) : selected) && <CheckBoxIcon color='success' fontSize="small" /> || <CheckBoxIconBlank fontSize='small' />}
					{option.title}
					{option?.[optionKey]}
				</li>
			)}
			onChange={(event, newValue) => {
				if (isSelectAll && newValue.find(option => option.all)) {
					changeHandler(value?.length === data.length ? [] : data);
					return setValues(value?.length === data.length ? [] : data);
				}
				setValues(newValue);
				changeHandler(newValue);
			}}
		/>
	);
}

export default EVAutocomplete;
