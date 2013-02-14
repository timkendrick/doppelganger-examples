var server = require('./doppelganger-server');

// Parse command-line arguments into a key-value dictionary
var arguments = process.argv.slice(2).reduce(function (arguments, argument) {
	var value = /(.+?)=(.+)/.exec(argument) || [null, argument, true];
	arguments[value[1]] = value[2];
	return arguments;
}, {});

// Get constants from environment variables / command-line arguments / default values
var PORT = (process.env.PORT || process.env.npm_package_config_port || arguments.port || 8000);
var DEBUG = (process.env.DEBUG === 'true' || process.env.npm_package_config_debug === 'true' || arguments.debug === 'true' || false);

// Load the dictionary of active apps
var appConfig = require('./doppelganger-apps');

// Start timing server startup
if (DEBUG) { console.time('Server initialised in'); }

// Start the server
server.init(appConfig, PORT, DEBUG, _handleServerStarted);

// Write status message to the log
function _handleServerStarted() {
	if (DEBUG) { console.timeEnd('Server initialised in'); } 
	console.log('Server listening on port ' + PORT + ', debug mode ' + (DEBUG ? 'on' : 'off'));
}