'use strict';

App.View.MapToolbar = Backbone.View.extend({
  _template: _.template( $('#map_toolbar_template').html() ),

  initialize: function(options) {
    this.layersControl = new App.View.LayerControl();
  },

  onClose: function(){

    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template());
    this.layersControl.setElement(this.$('.layers_control'));
    this.layersControl.render();

    return this;
  }

});
