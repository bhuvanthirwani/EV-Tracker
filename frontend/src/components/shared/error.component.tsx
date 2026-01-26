import Swal from 'sweetalert2';
import AppPath from '../../AppPath.constants';

const regex5xx = /^50[0-9]{1}$/i;
const regex4xx = /^40[0-9]{1}$/i;
const ErrorAlertTime = 3000;

const ErrorComponent = (error: any) => {
	const errorStatus = error?.response?.status || error?.status;

	const handleError = (errorMessage: string) => {
		if (errorStatus) {
			if (regex5xx.test(errorStatus)) {
				localStorage.setItem('error_message', errorMessage);
				Swal.fire({
					html: errorMessage,
					timer: ErrorAlertTime,
					timerProgressBar: true,
					showConfirmButton: false,
					position: 'bottom',
					toast: true,
					background: '#f16677'
				})
			} else if (!navigator.onLine || (regex4xx.test(errorStatus) && !location.pathname.includes(AppPath.LOGIN))) {
				Swal.fire({
					html: `${errorMessage}`,
					timer: ErrorAlertTime,
					timerProgressBar: true,
					showConfirmButton: false,
					position: 'bottom',
					toast: true,
					background: '#f16677',
					color: '#fff'
				}).then(() => {
					localStorage.clear();
					if (!location.pathname.includes(AppPath.LOGIN)) { location.reload(); }
				})
			}
		} else {
			Swal.fire({
				html: errorMessage,
				timer: ErrorAlertTime,
				timerProgressBar: true,
				showConfirmButton: false,
				position: 'bottom',
				toast: true,
				background: '#f16677',
				grow: 'row'
			})
		}
	}

	if (!navigator.onLine) {
		handleError('Seems like you\'ve lost Internet!');
	} else {
		handleError(
			error?.response?.data?.error ||
			error?.response?.data?.error?.message ||
			error?.message ||
			JSON.parse(error?.request?.responseText)['message'] ||
			'Something went wrong!');
	}
}

export default ErrorComponent;
