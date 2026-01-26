import {getRequest} from '../../api-service';
import API from '../../API_ENDPOINTS.constant';

const getRefreshToken = async (timeout: number) => {
	const tokenInterval = setInterval(async () => {
		return getRequest(
			API.REFRESH_TOKEN, {})
			.then((response: any) => {
				localStorage.setItem('auth', response?.data?.token);
			})
			.catch(err => {
				console.error(err);
				localStorage.clear();
				location.reload();
				clearInterval(tokenInterval);
			});
	}, ((timeout - 10) * 1000) || (((24 * 60 * 60) - 15) * 1000));
}

export default getRefreshToken;
