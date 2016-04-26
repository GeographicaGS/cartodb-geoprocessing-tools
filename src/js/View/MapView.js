'use strict';

App.View.Map = Backbone.View.extend({
  
  id: 'map',

  initialize: function(options) {
  
  },

  onClose: function(){
    this.stopListening();
  },
  
  render: function(){
    this.$el.css('width','100%').css('height','500px');
    cartodb.createVis('map', App.Config.viz_api_url('documentation') + '/' + this.model.get('viz') + '/viz.json');

    return this;
  }

});
