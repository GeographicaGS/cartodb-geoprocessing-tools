'use strict';

App.View.MapToolbar = Backbone.View.extend({
  _template: _.template( $('#map_toolbar_template').html() ),
  _map: null,

  initialize: function(options) {
    var options = options || {};
    if(options.map)
      this._map = options.map;
    // this.layersControl = new App.View.LayerControl();
  },

  onClose: function(){

    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template());
    // this.layersControl.setElement(this.$('.layers_control'));
    // this.layersControl.render();

    this.groupLayer = new App.View.GroupLayer({
      model : this.model,
      el: this.$('.layers_control'),
      map: this._map
    });
    this.groupLayer.render();

    return this;
  }

});
