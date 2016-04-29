'use strict';

App.View.MapLegend = Backbone.View.extend({
  _template: _.template( $('#map_legend_template').html() ),

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
