'use strict';

App.View.Map = Backbone.View.extend({
  
  initialize: function(options) {
  
  },

  onClose: function(){
    this.stopListening();
  },
  
  render: function(){
    
    cartodb.createVis('map', App.Config.viz_api_url('documentation') + '/' + this.model.get('viz') + '/viz.json');

    return this;
  }

});
