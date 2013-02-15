define(
	[
		"jquery",
		"underscore",
		
		"data",
		
		"views/FAQPageView",
		"views/SidebarView"
	],
	function(
		$,
		_,
		
		data,
		
		FAQPageView,
		SidebarView
	) {
		var appRoot = '/';
		
		var urls = _(data.questions).map(function(question) { return question.title.toLowerCase().replace(/[^a-z]+/g, '-').replace(/\-$/, '')});
		
		var sidebarView = _createSidebarView(data.questions, urls);
		var contentView = _createContentView(data.index.title, data.index.content);
		
		$('[data-id=sidebar]').empty().append(sidebarView.$el);
		$('[data-id=content]').empty().append(contentView.$el);
		
		_createAppRouter(sidebarView, contentView, urls);
		
		_initLinks(appRoot);
		
		Backbone.history.start({ pushState: true, root: appRoot });
		
		
		function _createSidebarView(questions, urls) {
			
			var itemsData = _(questions).map(
				function(question, index) {
					return { url: appRoot + urls[index], label: question.title };
				}
			);
			
			var sidebarModel = new Backbone.Model({
				items: itemsData,
				selected: -1
			});
			
			return new SidebarView({ model: sidebarModel }).render();
		}
		
		function _createContentView(title, content) {
			
			var pageModel = new Backbone.Model({
				title: title,
				content: content
			});
			
			return new FAQPageView({ model: pageModel }).render();
		}
		
		function _createAppRouter(sidebarView, contentView, questionURLs) {
			
			var AppRouter = Backbone.Router.extend({
				routes: {
					'': 'index',
					':question': 'question'
				},
				
				index: function() {
					contentView.model.set({ title: data.index.title, content: data.index.content });
					sidebarView.model.set("selected", -1);
				},
				
				question: function(question) {
					var index = _(questionURLs).indexOf(question);
					if (index === -1) {
						Backbone.history.navigate('', true);
						return;
					}
					contentView.model.set({ title: data.questions[index].title, content: data.questions[index].content });
					sidebarView.model.set("selected", index);
				}
			});
			
			return new AppRouter();
		}
		
		function _initLinks(appRoot) {
			// All navigation that is relative should be passed through the navigate
			// method, to be processed by the router. If the link has a `data-bypass`
			// attribute, bypass the delegation completely.
			if (typeof document !== 'undefined') {
				$(document).on("click", "a[href]:not([data-bypass])", function(evt) {
					// Get the absolute anchor href.
					var href = { prop: $(this).prop("href"), attr: $(this).attr("href") };
					// Get the absolute root.
					var root = location.protocol + "//" + location.host + appRoot;
					
					// Ensure the root is part of the anchor href, meaning it's relative.
					if (href.prop.slice(0, root.length) === root) {
						// Stop the default event to ensure the link will not cause a page
						// refresh.
						evt.preventDefault();
						
						// `Backbone.history.navigate` is sufficient for all Routers and will
						// trigger the correct events. The Router's internal `navigate` method
						// calls this anyways.  The fragment is sliced from the root.
						Backbone.history.navigate(href.prop.slice(root.length), true);
					}
				});
			}
		}
	}
);