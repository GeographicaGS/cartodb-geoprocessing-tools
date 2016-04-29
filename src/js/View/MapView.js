'use strict';

App.View.Map = Backbone.View.extend({
  
  id: 'map',

  initialize: function(options) {
    _.bindAll(this,'_onDone');
  },

  onClose: function(){
    this.stopListening();
    if (this._controlLayer)
      this._controlLayer.close();
  },
  
  render: function(){
    this.$el.css('width','100%').css('height','500px');
    
    // // Create VIS
    // cartodb.createVis('map', App.Config.viz_api_url(this.model.get('account')) + '/' + this.model.get('viz') + '/viz.json')
    //   .done(this._onDone);

    var map;
    var mapOptions = {
      zoom: 5,
      center: [43, 0]
    };
    map = new L.Map('map', mapOptions);

    cartodb.createLayer(map, App.Config.viz_api_url(this.model.get('account')) + '/' + this.model.get('viz') + '/viz.json')
      .addTo(map)
      .on('done', function(layer) {
        // layer
        //   .on('featureOver', function(e, latlng, pos, data) {
        //     console.log(e, latlng, pos, data);
        //   })
        //   .on('error', function(err) {
        //     console.log('error: ' + err);
        //   });
        console.log(layer);
      }).on('error', function(err) {
        console.log("some error occurred: " + err);
      });
    
    return this;
  },

  _onDone: function(vis,layers){
    var l = _.find(layers, function(l){ 
        return l.type == 'layergroup';
      });
      
      
      // this._controlLayer = App.View.ControlLayer({
      //   'layergroup': l
      // });
  }

});
