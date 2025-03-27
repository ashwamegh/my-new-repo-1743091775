module.exports = {
	globDirectory: 'public/',
	globPatterns: [
		'**/*.{png,ico,svg,html,json}'
	],
	swDest: 'dist/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};