App.View.Tool.Bookmarks = Backbone.View.extend({
  _template: _.template( $('#tool-bookmark_template').html() ),

  initialize: function(options) {
  	this._map = options.map;
    this._geoVizModel = options.geoVizModel;
  	this.bookmarkCollection = new Backbone.Collection(this._geoVizModel.get('bookmarks'));
  },

  events: {
  	'click .add': '_showAddBlock',
  	'click .cancel_add': '_hideAddBlock',
  	'click .save_b': '_saveBookmark',
  	'click .bookmarks_list li': '_loadBookMark',
  	'click .bookmarks_list li .remove': '_showRemoveBlock',
    'click .cancel_remove': '_cancelRemove',
    'click .confirm_remove': '_removeBookmark',
    'click .close_error': '_closeError',
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
  	e.preventDefault();
  	var title = this.$('.add_block input[type=text]').val();
  	if(title != ''){
      if(this.bookmarkCollection.where({'title':title}).length == 0){
        var bound = this._map.getBounds();
  			var model = new Backbone.Model({'title':title, 'bound':[[bound._southWest.lat,bound._southWest.lng],[bound._northEast.lat,bound._northEast.lng]]});
  			this.bookmarkCollection.add(model);
        this._geoVizModel.set('bookmarks',this.bookmarkCollection.toJSON());
        this._geoVizModel.save();
  			this.render();

      }else{
        this.$('.add_block').addClass('hide');
        this.$('.error_block').addClass('activated');
      }
  	}
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
    $(e.currentTarget).addClass('hide');
    $(e.currentTarget).closest('li').find('.remove_block').addClass('activated');
  },

  _cancelRemove:function(e){
    e.preventDefault();
    e.stopPropagation();
    $(e.currentTarget).closest('.remove_block').removeClass('activated');
    $(e.currentTarget).closest('li').find('.remove').removeClass('hide');
  },

  _removeBookmark:function(e){
    e.preventDefault();
    e.stopPropagation();
    var title = $(e.currentTarget).closest('li').attr('bookmark');
    var models = this.bookmarkCollection.where({'title':title});
    if(models.length > 0){
      var model = models[0];
      this.bookmarkCollection.remove(model);
      this._geoVizModel.set('bookmarks',this.bookmarkCollection.toJSON());
      this._geoVizModel.save();
      this.render();
    }
  },

  _closeError:function(){
    this.$('.add_block').removeClass('hide');
    this.$('.error_block').removeClass('activated');
  },

  render: function(){
    this.$el.html(this._template({'bookmarks':this.bookmarkCollection.toJSON()}));
    return this;
  }

});
