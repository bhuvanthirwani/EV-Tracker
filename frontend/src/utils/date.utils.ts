export const companyInitDate = new Date(new Date().setFullYear(2018, 4, 1));

export const formatDate = (date: any) => new Intl.DateTimeFormat('en-in', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(date));

export const msToDateTime = (date: number) => new Intl.DateTimeFormat('en-us', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(new Date(date));

export const setSlotTime = (value: any) => {
	const hours = parseInt(value);
	const min = parseFloat(value) - hours === 0.5 ? 30 : 0;

	return new Date(new Date().setHours(hours, min, 0, 0)).toISOString().slice(0, 19);
}

export const formatTiming = (value: any) => {
	let timing = '';
	if (value >= (60 * 60)) {
		const hours = Math.floor(value / (60 * 60));
		const minutes = Math.floor((value - hours * 60 * 60) / 60);
		timing = minutes > 0 ? `${hours} hrs ${minutes} mins` : `${hours} hrs`;
	} else if (value >= 60) {
		const minutes = Math.floor(value / 60);
		const seconds = Math.round((value - minutes * 60) / 60);
		timing = seconds > 0 ? `${minutes} mins ${seconds} secs` : `${minutes} mins`;
	}

	return timing;
}

export const formatDateWithYear = (date: string) => new Intl.DateTimeFormat('en-us', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));

// @ts-ignore
export const formatDateWithYearAndTime = (date: string | number | any) => {
	if (date) {
		if (typeof date === typeof 111) {
			date = date * 1000;
		}
		return new Intl.DateTimeFormat('en-us', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' }).format(new Date(date));
	}
}

export const formatTimeWithDHM = (minutes: number) => {
	const days = Math.floor(minutes / (24 * 60));
	minutes -= days * (24 * 60);
	const hours = Math.floor(minutes / 60);
	minutes -= hours * 60;
	if (days) {
		return `${days}d ${hours}h ${minutes}m`;
	} else if (hours) {
		return `${hours}h ${minutes}m`;
	} else {
		return `${minutes}m`;
	}
};


export const defaultFromDate = new Date(new Date(new Date().setDate(new Date().getDate())).setHours(0, 0, 0, 0));
export const defaultToDate = new Date();
