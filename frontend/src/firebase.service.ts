// Mock Config to replace Firebase Remote Config
const rcDefaultsJson: any = {
	"some_config_key": { "_value": "some_value" },
	"mbt": { "_value": "pk.eyJ1IjoiZGV2aGF4Y29kZXMiLCJhIjoiY21rdGh2MDNqMXFtNDNlcTB4ZW96Z2hzNCJ9.FfBPSIOc7_IzXs2dptML2A" }
};

export const getAppConfig = () => {
	localStorage.setItem('config', JSON.stringify(rcDefaultsJson));
	return Promise.resolve();
};

export const getConfigByKey = async (key: string) => {
	return rcDefaultsJson[key]?._value || "";
};

export const getConfig = (key: string) => {
	let response = null;
	if (localStorage.getItem('config')) {
		try {
			const config = JSON.parse(localStorage.getItem('config') as string);
			response = config[key]?._value || config[key];
		} catch (e: any) {
			response = null;
		}
	}
	return response || {};
}

// Ensure config is initialized
getAppConfig();

export default {}; // Dummy export to satisfy imports
