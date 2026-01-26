module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		"project": ["tsconfig.json"]
	},
	plugins: [
		'@typescript-eslint',
	],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		"quotes": ['warn', 'single']
	},
	"env": {
        "browser": true,
        "node": true
    }
};
