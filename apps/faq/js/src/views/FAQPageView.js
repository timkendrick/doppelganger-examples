define(
	[
		"underscore",
		"backbone"
	],
	function(
		_,
		Backbone
	) {
		return Backbone.View.extend({
			
			tagName: "div",
			className: "faq-page-view",
			
			template: _.template('<p class="lead"><%= title %></p><div><%= content %></div></div>'),
			
			render: function() {
				this.model.off("change", this.render, this);
				
				this.$el.html(this.template(this.model.toJSON()));
				
				this.model.on("change", this.render, this);
				
				return this;
			}
		})
	}
);