'use strict';

App.View.LayerControl = Backbone.View.extend({
  _template: _.template( $('#layercontrol_template').html() ),

  initialize: function(options) {

  },

  onClose: function(){

    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template());

    return this;
  }

});
