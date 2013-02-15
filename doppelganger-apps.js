/**
 * @fileoverview Dictionary of active Doppelganger app configurations
 * 
 * Dictionary keys represent the app's virtual root path on the server, and must start and end with a slash.
 * 
 * Each Doppelganger app definition specifies 3 properties:
 * 
 * * The path to the app's index page template, relative to the server root
 * * The path to the app's Require.js config file, relative to the server root
 * * The path to the app's static asset directory, or `null` if the app does not need to serve static assets
 * 
 * The following example shows how multiple Doppelganger apps can run simultaneously on the same server:
 * 
 * ```javascript
 *     module.exports = {
 *         "/":         { "index": "apps/main/index.html", "config": "apps/main/js/config.js", "assets": "apps/main" },
 *         "/support/": { "index": "apps/support/index.html", "config": "apps/support/js/config.js", "assets": "apps/support" },
 *         "/cms/":     { "index": "apps/cms/index.html", "config": "apps/cms/js/config.js", "assets": "apps/cms" }
 *     };
 *  ```
 */
module.exports = {
	"/": { "index": "apps/faq/index.html", "config": "apps/faq/js/src/config.js", "assets": "apps/faq" }
};