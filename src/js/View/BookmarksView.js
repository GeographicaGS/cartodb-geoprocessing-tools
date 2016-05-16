App.View.Bookmarks = Backbone.View.extend({
  _template: _.template( $('#bookmark_template').html() ),

  initialize: function(options) { 
  	this._map = options.map;
  	this.bookmarkCollection = new Backbone.Collection();
  },

  events: {
  	'click .add_b': '_showAddBlock',
  	'click .cancel_add': '_hideAddBlock',
  	'click .save_b': '_saveBookmark',
  	'click .bookmarks_list li': '_loadBookMark',
  	'click .bookmarks_list li .remove': '_showRemoveBlock',
  },

  _showAddBlock:function(e){
  	e.preventDefault();
  	$(e.currentTarget).addClass('hiden');
  	this.$('.add_block').addClass('activated');
  },

  _hideAddBlock:function(e){
  	e.preventDefault();
  	this.$('.add_block').removeClass('activated');
  	this.$('.add_b').removeClass('hiden');
  },

  _saveBookmark:function(e){
  	// e.preventDefault();
  	// var title = this.$('.add_block input[type=text]').val();
  	// if(title != ''){
  	// // 	var bound = $.map(this._map.getBounds().toBBoxString().split(','),function(value){
   // //  		return parseFloat(value);
			// // });
			// // var model = new Backbone.Model({'title':title, 'bound':[[bound[1],bound[0]],[bound[3],bound[2]]]});
			// var model = new Backbone.Model({'title':title, 'bound':this._map.getBounds()});
			// this.bookmarkCollection.add(model);
			// this.render();
  	// }
  	this._map.fitBounds(this._map.getBounds());
  },

  _loadBookMark:function(e){
  	var title = $(e.currentTarget).attr('bookmark');
  	var models = this.bookmarkCollection.where({'title':title});
  	if(models.length > 0){
  		var model = models[0];
  		this._map.fitBounds(model.get('bound'));
  	}
  },

  _showRemoveBlock:function(e){
  	e.preventDefault();
  	e.stopPropagation();
  	alert('a');
  },

  render: function(){
    this.$el.html(this._template({'bookmarks':this.bookmarkCollection.toJSON()}));
    return this;
  }

});