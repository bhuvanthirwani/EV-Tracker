import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import API from './API_ENDPOINTS.constant';
import AppPath from './AppPath.constants';
import ErrorComponent from './components/shared/error.component';


/**
 * Request interceptor for API calls
 * - Gets the User Authorization token from localStorage
 * - Passes the token as Authorization - Request header
 */
axios.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	const authToken = localStorage.getItem('auth');
	const authRequired = !(location.pathname.includes('live') || location.pathname.includes('expired') || location.pathname.includes(AppPath.LOGIN));
	if (authRequired) {
		if (authToken) {
			config.headers.set('Authorization', authToken);
			config.headers.set('Access-Control-Allow-Origin', '*');
		} else if (!window.location.href.includes(AppPath.LOGIN)) {
			window.location.href = `${window.location.origin}${AppPath.LOGIN}`;
		}
	} else {
		config.headers.set('Authorization', 'auth');
		config.headers.set('Access-Control-Allow-Origin', '*');
	}

	if (config?.url?.includes(API.LOGIN)) {
		config.headers.set('Authorization', 'Basic ' + btoa(config?.data?.user_key + ':' + config?.data?.password));
		config.headers.set('Access-Control-Allow-Origin', '*');
		config.data = {};
	}

	return config;
});

axios.interceptors.response.use((response: any) => {
	try {
		if (response) {
			return response
		} else {
			return Promise.reject(response);
		}
	}
	catch (error) {
		if (typeof error.response === 'undefined') {
			// + 'This could be a CORS issue or a dropped internet connection. '
			// + 'It is not possible for us to know.')
			handleError(error.toJSON());
		}
		return Promise.reject(error)
	}
});

const URI = (typeof process !== 'undefined' && process.env.REACT_APP_API_URL) || '/api/v1';

export const abortController = new AbortController();

const joinPaths = (base: string, path: string) => {
	const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
	const cleanPath = path.startsWith('/') ? path : `/${path}`;
	return `${cleanBase}${cleanPath}`;
}

/**
 * Common: GET method to call REST API
 * @param endpoint	URI ex. `https://example.com`
 * @param params	QueryParams Object {key: value}
 */
export const getRequest = async (endpoint: string, params: any, microservice_base?: string) => {
	const fullUrl = joinPaths(microservice_base || URI, endpoint);
	return (
		await axios
			.get(fullUrl, {
				params,
				signal: abortController.signal
			}).catch((error: AxiosError) => handleError(error))
	);
}

/**
 * Common: POST method to call REST API
 * @param endpoint	URI ex. `https://example.com`
 * @param params	BodyParams Object {key: value}
 */
export const postRequest = async (endpoint: string, params: any, microservice_base?: string) => {
	const fullUrl = joinPaths(microservice_base || URI, endpoint);
	return await axios
		.post(
			fullUrl,
			{
				...params,
				signal: abortController.signal
			},
			{
				headers: {
					'client': 'web',
				}
			}).catch((error: AxiosError) => {
				if (endpoint === API.LOGIN) {
					throw error;
				} else {
					handleError(error);
				}
			});
}

/**
 * Common: API Error Handler
 * @param error	AxiosError
 */
const handleError = (error: object) => ErrorComponent(error);
