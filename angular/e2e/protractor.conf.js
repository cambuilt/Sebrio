// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

exports.config = {
	allScriptsTimeout: 50000,
	specs: [
		'./src/auditing.e2e-spec.ts',
		'./src/cancellation.e2e-spec.ts',
		'./src/client.e2e-spec.ts',
		'./src/collection-list.e2e-spec.ts',
		'./src/container.e2e-spec.ts',
		'./src/devices.e2e-spec.ts',
		'./src/hubs-add.e2e-spec.ts',
		'./src/label.e2e-spec.ts'
	],
	capabilities: {
		'browserName': 'chrome'
	},
	directConnect: true,
	baseUrl: 'http://localhost:4200/',
	framework: 'jasmine',
	seleniumAddress: 'http://localhost:4444/wd/hub',
	jasmineNodeOpts: {
		showColors: true,
		defaultTimeoutInterval: 300000,
		print: function () { }
	},
	onPrepare() {
		require('ts-node').register({
			project: require('path').join(__dirname, './tsconfig.e2e.json')
		});
		jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: false } }));

		// Require the Reporter (in your onPrepare)
		const failWhale = require('protractor-jasmine2-fail-whale');

		// Add the Fail Whale Reporter
		jasmine.getEnv().addReporter(new failWhale({
			// Set to true if you would like to see the stack trace
			showStack: false,
			keepWebDriverAlive: false
		}));
	}
};