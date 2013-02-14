require.config({
	deps: ['main'],
	
	paths: {
		'backbone': '../lib/backbone',
		'underscore': '../lib/underscore',
		'jquery': '../lib/jquery'
	},
	
	shim: {
		'backbone': {
			deps: ['jquery', 'underscore'],
			exports: 'Backbone'
		},
		'underscore': {
			exports: '_'
		},
		'jquery': {
			exports: 'jQuery'
		}
	}
});