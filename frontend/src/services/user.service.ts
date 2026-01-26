import {getRequest} from '../api-service';
import API from '../API_ENDPOINTS.constant';

const UserService = {
	getUserById: async () => {
		const user: any = await getRequest(API.USER_VEHICLES, {});
		return user?.data?.vehicles;
	},
}

export default UserService;
