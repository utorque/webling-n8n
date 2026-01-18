module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 2020,
		sourceType: 'module',
	},
	plugins: ['@typescript-eslint'],
	extends: ['plugin:n8n-nodes-base/nodes'],
	rules: {
		'n8n-nodes-base/node-param-display-name-miscased': 'warn',
		'n8n-nodes-base/node-param-placeholder-miscased-id': 'warn',
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
	},
};
