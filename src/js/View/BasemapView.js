'use strict';

App.View.BaseMap = Backbone.View.extend({
  _template: _.template( $('#base_map_template').html() ),

  initialize: function(options) {
  	this._base_layer = options.base_layer;
  	this._label_layer = options.label_layer;
  	this._geoVizModel = options.geoVizModel;
  	this._map = options.map;
  	this._baseMapCollection = new App.Collection.BaseMap();
  	var map;
  	if(this._geoVizModel.get('basemap')){
  		map = this._baseMapCollection.findMap(this._geoVizModel.get('basemap').id,this._geoVizModel.get('basemap').title);
  		if(this._geoVizModel.get('basemap').id == 'OneMap')
  			this._map.setView([1.3751664,103.7800963],13)
  	}else{
  		map = this._baseMapCollection.findMap('CartoDB','Positron');
  	}

  	this.currentThumb = map.thumb;
  	this._base_layer._url = map.url;
  	this._label_layer._url = map.url_label;
  	this._base_layer.redraw();
  	this._label_layer.redraw();
  	this._base_layer.setOpacity(1);
  	this._label_layer.setOpacity(1);
  },

  events: {
  	'click .option-button' : '_toggleBaseMaps',
    'click .base_map_poup .thumb' : '_changeBaseMap'
  },

	onClose: function(){
    this.stopListening();
  },

  _toggleBaseMaps:function(){
  	this.$('.base_map_poup').toggleClass('activated');
  },

  _changeBaseMap:function(e){
  	var id = $(e.currentTarget).closest('[group]').attr('group'),
  			title = $(e.currentTarget).closest('li').attr('data-title'),
  			map = this._baseMapCollection.findMap(id,title);

  	this._base_layer._url = map.url;
  	this._base_layer.redraw();
  	if(map.url_label != ''){
  		this._label_layer._url = map.url_label;
  		this._label_layer.redraw();
  		this._label_layer.setOpacity(1);
  	}else{
  		this._label_layer.setOpacity(0);
  	}
  	this._geoVizModel.set('basemap',{'id':id,'title':title});
    this._geoVizModel.save();

    if(this._geoVizModel.get('basemap').id == 'OneMap')
  			this._map.setView([1.3751664,103.7800963],13)

		this.currentThumb = map.thumb;
    this.render();
  },
  

  render: function(options){
  	this.$el.html(this._template({'g_maps':this._baseMapCollection.toJSON(), 'thumb':this.currentThumb}));
    return this;
  }

});
