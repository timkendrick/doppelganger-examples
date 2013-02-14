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
			
			tagName: "ul",
			className: "sidebar-view nav nav-tabs nav-stacked",
			
			template: _.template('<% for (var i = 0, l = items.length; i < l; i++) { var item = items[i]; %><li<%= (i === selected ? \' class="active"\' : \'\') %>><a href="<%= item.url %>"><i class="icon-chevron-right pull-right"></i> <%= item.label %></a></li><% } %>'),
			
			render: function() {
				this.model.off("change", this.render, this);
				
				this.$el.html(this.template(this.model.toJSON()));
				
				this.model.on("change", this.render, this);
				
				return this;
			}
		})
	}
);