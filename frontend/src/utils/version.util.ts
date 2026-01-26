const getAppVersion = () => {
	const app = document.getElementById('app');
	return `v${app?.getAttribute('data')}`;
}

export default getAppVersion;
