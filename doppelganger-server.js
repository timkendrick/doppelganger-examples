var http = require('http');
var fs = require('fs');
var node_static = require('node-static');
var Doppelganger = require('doppelganger');

/**
 * Initialise the server
 * @param {Object} appConfig Directory of Doppelganger apps to load
 * @param {Number} port Port to listen on
 * @param {Boolean} [debug=false] Run in debug mode
 * @param {function} [callback] Callback to invoke once the server has started
 */
exports.init = function(appConfig, port, debug, callback) {
	
	// Keep track of which apps are loaded, and which have yet to be loaded
	var apps = [];
	
	// Create Doppelganger app instances for all the apps specified in the app config file
	for (var appRoot in appConfig) {
		if (appRoot.charAt(0) !== '/') { throw new Error('App root paths must start with a leading slash'); }
		if (appRoot.slice(-1) !== '/') { throw new Error('App root paths must end with a trailing slash'); }
		var appData = appConfig[appRoot];
		var indexTemplate = fs.readFileSync(appData.index); 
		var configPath = appData.config;
		var app = new Doppelganger(indexTemplate, configPath, appRoot);
		apps.push({ app: app, appRoot: appRoot, staticRoot: appData.assets });
	}
	
	// Initialise the Doppelganger app instances
	var numLoaded = 0;
	apps.forEach(function(appData) {
		if (debug) { console.log('Loading Doppelganger app... "' + appData.appRoot + '"'); }
		appData.app.init(function() {
			if (debug) { console.log('Initialised Doppelganger app... "' + appData.appRoot + '"'); }
			if (++numLoaded === apps.length) { _startServer(apps, port, debug, callback) }
		});
	});
	
	
	/**
	 * Start the server with the specified Doppelganger apps
	 * @param {Array} apps Array containing Doppelganger apps and associated configuration data
	 * @param {Number} port Port to listen on
	 * @param {Boolean} [debug=false] Run in debug mode
	 * @private
	 */
	function _startServer(apps, port, debug, callback) {
		// Create a dictionary of redirects to add slashes to app names
		var redirects = {};
		
		// Create a server for serving each app's content and static assets
		var appServers = apps.map(function(appData) {
			
			// Add a redirect entry for when this app is accessed without the trailing slash
			if (appData.appRoot !== '/') { redirects[appData.appRoot.slice(0, -1)] = appData.appRoot; }
			
			// Create the server
			return new AppServer(appData.app, appData.appRoot, appData.staticRoot);
		});
		
		// Sort the list of servers to prevent wildcards catching requests that were meant for more specific app servers
		appServers = appServers.sort(function(a, b) { return b.root.length - a.root.length; });
		
		// Create an HTTP server to deal with all the Doppelganger apps and their respective static assets
		http.createServer(function (request, response) {
			
			request.addListener('end', function() {
				
				if (debug) { console.time('GET ' + request.url); }
				
				if (request.url in redirects) {
					var hostname = (request.connection.encrypted ? 'https://' : 'http://') + request.headers.host;
					response.writeHead(301, { 'Location': hostname + redirects[request.url] });
					response.end();
				} else {
					_handleRequest(request, response);
				}
				
				if (debug) { console.timeEnd('GET ' + request.url); }
			});
			
			
			function _handleRequest(request, response) {
				
				// Loop through all the servers to try to find one that can process the request
				for (var i = 0, l = appServers.length; i < l; i++) {
					var appServer = appServers[i];
					
					// If the URL doesn't start with the app's root path, try the next one
					if (request.url.indexOf(appServer.root) !== 0) { continue; }
					
					// Process the request
					appServer.serve(request, response);
					
					// We've already processed the request, so there's no need to try the rest of the app servers
					return;
				}
				
				// The request didn't match any of the apps' URLs, so return a 404
				response.writeHead(404, { 'Content-Type': 'text/plain' });
				response.end('404 Not Found');
			}
		}).listen(port);
		
		// The server has started up, so invoke the callback
		if (callback) { callback(); }
	}

	/**
	 * Doppelganger App server, capable of processing both app requests and static asset requests
	 * @param {Doppelganger} app Doppelganger app instance
	 * @param {String} appRoot Virtual app route within the main server
	 * @param {String} [staticRoot] Path to the app's static assets relative to the server root, if needed
	 * @constructor
	 * @private
	 */
	var AppServer = function AppServer(app, appRoot, staticRoot) {
		this.app = app;
		this.root = appRoot;
		if (typeof staticRoot === 'string') { this._staticServer = new node_static.Server(staticRoot); }
	};

	/**
	 * Doppelganger app instance
	 * @type {Doppelganger}
	 */
	AppServer.prototype.app = null;

	/**
	 * Virtual app route within the main server
	 * @type {String}
	 */
	AppServer.prototype.root = null;

	/**
	 * Static asset server instance
	 * @type {Server}
	 * @private
	 */
	AppServer.prototype._staticServer = null;

	/**
	 * Process a request, writing output to the response object
	 * @param {http.ServerRequest} request Request object
	 * @param {http.ServerResponse} response Response object
	 */
	AppServer.prototype.serve = function(request, response) {
		// Get the URL path, relative to the app's root path rather than the server root
		var route = request.url.substr(this.root.length);
		
		// Check whether the URL is a valid route within the current app
		if (this.app.routeExists(route)) {
			
			try {
				// Point the app instance to the requested route
				this.app.navigate(route);
				
				// Get the HTML of the current state of the app's DOM tree
				var content = this.app.getHTML();
				
				// Write the response
				response.writeHead(200, { 'Content-Type': 'text/html' });
				response.end(content);
				
			} catch (error) {
				
				if (debug) {
					throw error;
				} else {
					
					// Write the response
					response.writeHead(500, { 'Content-Type': 'text/plain' });
					response.end('Internal server error');
				}
			}
			
		} else if (this._staticServer) {
			
			// Temporarily change the request URL to be relative to this app's static root
			var originalURL = request.url;
			request.url = '/' + route;
			
			// The request didn't match any of the app's routes, so serve this request as a static asset
			this._staticServer.serve(request, response, function(error, result) {
				if (error) {
					response.writeHead(error.status, { 'Content-Type': 'text/plain' });
					response.end(error.status + ' ' + error.message);
				}
			});
			
			// Change the request URL back to the original URL
			request.url = originalURL;
			
		} else {
			
			// The request didn't match any of the app's routes, and there's no static asset server, so return a 404
			response.writeHead(404, { 'Content-Type': 'text/plain' });
			response.end('404 Not Found');
		}
	}
};