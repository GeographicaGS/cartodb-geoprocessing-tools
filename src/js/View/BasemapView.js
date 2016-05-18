'use strict';

App.View.BaseMap = Backbone.View.extend({
  _template: _.template( $('#base_map_template').html() ),

  initialize: function(options) {
  	this.base_layer = options.base_layer;
  	this.label_layer = options.label_layer;
  	this.base_layer._url = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
  	this.label_layer._url = 'http://b.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png'
  	this.base_layer.redraw();
  	this.label_layer.redraw();
  	this.base_layer.setOpacity(1);
  	this.label_layer.setOpacity(1);
  },

  events: {
    'click .base_map_poup .thumb' : '_changeBaseMap',
  },

	onClose: function(){
    this.stopListening();
  },

  _changeBaseMap:function(){
  	this._base_layer._url = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
  	this._base_layer.redraw();
  },
  

  render: function(options){
  	this.$el.html(this._template());
    return this;
  }

});
