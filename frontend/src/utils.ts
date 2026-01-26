const EMAIL_REGEX = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;

export const getLocalStoreItem = (key: string): string | null => localStorage.getItem(key);

export const setLocalStoreItem = (key: string, value: string): void => localStorage.setItem(key, value);

export const isValidEmail = (email: string): boolean => EMAIL_REGEX.test(email);

export const checkDateDifference = (endDate: Date, startDate: Date) => Math.floor((Date.parse(endDate.toString()) - Date.parse(startDate.toString())) / 86400000);

export const ENABLE_GEOCODING = process.env.NODE_ENV != 'development';

export const createPageTitle = (index: number) => {
	const loc = location.pathname.split('/');
	const title = loc[loc.length - index];
	return title.charAt(0).toLocaleUpperCase() + title.slice(1) + ' | ' + 'Tesla';
}

