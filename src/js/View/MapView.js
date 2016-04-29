'use strict';

App.View.Map = Backbone.View.extend({
  _template: _.template( $('#map_template').html() ),

  initialize: function(options) {

    _.bindAll(this,'_onDone');

    this.header = new App.View.Header();
    this.footer = new App.View.Footer();
    this.toolbar = new App.View.MapToolbar();
  },

  onClose: function(){
    this.stopListening();
    if (this._controlLayer)
      this._controlLayer.close();
  },

  render: function(){

    this.setElement($('main'));
    this.$el.html(this._template());

    this.footer.setElement($('footer'));
    this.header.setElement($('header'));
    this.toolbar.setElement(this.$('.toolbar'));

    this.header.render();
    this.footer.render({classes: ''});
    this.toolbar.render();
    this.map = this.$('.map');
    this.map.css('width','100%').css('height', (this.$el.height() - 64) + "px"); // TODO: parameterize or calculate hardcoded toolbar height value (64px)

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
