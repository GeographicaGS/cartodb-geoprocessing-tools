'use strict';

App.View.Map = Backbone.View.extend({
  _template: _.template( $('#map_template').html() ),
  id: 'mapview',

  initialize: function(options) {

    _.bindAll(this,'_onFetchVizModel','resizeMap','_onCreatedVIS','_render');

    var m = new Backbone.Model({
      section: 'map',
      account : this.model.get('account'),
      title: 'Loading...'
    });
    this.header = new App.View.Header({model: m});
    this.footer = new App.View.Footer();

    this._user = App.getUserModel();
    this._user.checkPermissions(this.model.get('account'), function(status){
      if(!status){
        App.resetUserModel();
        App.router.navigate('login', {trigger: true});
      }
    });

  },

  onClose: function(){
    this.stopListening();
    $(window).off('resize');
    if (this.header)
      this.header.remove();
    if (this.footer)
      this.footer.remove();
    if (this._baseMapView)
      this._baseMapView.close();
  },

  _onFetchVizModel: function(m){
    this._nfetches++;

    if (this._nfetches==2){
      // Both models fetched. Let's do the merge
      this._mergeViz();
    }
  },

  _mergeViz: function(){

    // Check if it's a valid visualization (no support for named maps)
    if (!this._cartoVizModel.isValid()){
      alert('This kind of map is not supported. All your datasets in the map should be public.');
      App.router.navigate(this.model.get('account') + '/map_list',{trigger: true});
      return;
    }


    // Add GID to cartoVizModel
    this._cartoVizModel.addLayerGID();

    if (!this._geoVizModel.get('layers'))
        this._geoVizModel = new App.Model.GeoViz(this._cartoVizModel.toJSON());

    var geolayers = this._geoVizModel.getSublayers();
    var cartolayers = this._cartoVizModel.getSublayers();

    // Loop over geovizmodel layers
    var toremove = [];
    for (var i in geolayers){
      var geolayer = geolayers[i];
      if (!geolayer.geolayer){
        // Layer which comes from CartoDB Editor
        var cartolayer = this._cartoVizModel.findSublayer(geolayer.gid);
        if (!cartolayer){
          // It's a non geolayer and it's not at CartoDB. It has been removed from CartoDB editor.
          toremove.push(i);
        }
        else{
          // Copy the layer definition from CartoDB viz. CartoDB takes precedence over GeoViz except for visibility
          cartolayer.visible = geolayer.visible;
          //cartolayer.options.cartocss = geolayer.options.cartocss;
          geolayers[i] = cartolayer;
        }
      }
      else{
        // TODO check if parent layer exists at CartoDB Editor. If it doesn't exist should be removed
      }
    }

    // Remove all layers.
    for (var i in toremove){
      geolayers.splice(toremove[i],1);
    }

    // Copy layers from CartoViz which are not present at GeoViz. It happens when new layers are added at CartoDB editor
    for (var i in cartolayers){
      var cartolayer = cartolayers[i];
      if (!this._geoVizModel.findSublayer(cartolayer.gid)){
        // New layer. Let's add it
        console.debug('Added layer ' + cartolayer.gid);
        geolayers.push(cartolayer);
      }
    }

    this._geoVizModel.set('title',this._cartoVizModel.get('title'));
    this.header.updateTitle(this._geoVizModel.get('title'));

    if (this._user.get('autosave') && this._user.get('account')==this._geoVizModel.get('account'))
      this._geoVizModel.save();


    this._geoVizModel.calculateSublayersGeometryTypes(this._render);
    this._geoVizModel.createLayerManager();

    this.map.fitBounds(this._geoVizModel.get('bounds'));
    this._baseMapView = new App.View.BaseMap({'map':this.map, 'geoVizModel':this._geoVizModel, 'base_layer':this.vis.getLayers()[0], 'label_layer':this.vis.getLayers()[this.vis.getLayers().length-1]});
    this.$('.map-options').html(this._baseMapView.render().el);
  },

  _render: function(){

    this.toolbar = new App.View.MapToolbar({
      el: this.$('.toolbar'),
      model: this._geoVizModel,
      map: this.map,
      vis:this.vis
    });
    this.toolbar.render();
    this.$map.addClass('wToolbar');
  },

  render: function(){

    // this.setElement($('main'));
    this.$el.html(this._template());

    this.footer.setElement($('footer'));
    this.header.setElement($('header'));

    this.header.render();
    this.footer.render({classes: ''});

    this.$map = this.$('.map');
    this.$map.css('width','100%').css('height', this.$el.parent().height() + "px"); // TODO: parameterize or calculate hardcoded toolbar height value (64px)

    var url = 'https://alasarr.cartodb.com/api/v2/viz/d1e1bf50-1675-11e6-a016-0e3ff518bd15/viz.json';
    cartodb.createVis('map', url,{ https: true})
      .done(this._onCreatedVIS);

    return this;
  },

  _onCreatedVIS: function(vis,layers){

    this.map = vis.getNativeMap();
    this.vis = vis;

    // We only use the vis for the CartoDB loading control
    for (var i in layers){
      if(i!=0 && i!= layers.length -1)
        layers[i].remove();
      else
        layers[i].setOpacity(0);
    }

    this._cartoVizModel = new App.Model.CartoViz({
      id: this.model.get('viz'),
      account: this.model.get('account')
    });

    this._geoVizModel = new App.Model.GeoViz({
      id: this.model.get('viz'),
      account: this.model.get('account')
    });

    // Everything start after fetching models.
    this._nfetches = 0;

    this._cartoVizModel.fetch({
      success: this._onFetchVizModel
    });

    this._geoVizModel.fetch({
      success: this._onFetchVizModel
    });

    $(window).on('resize', this.resizeMap);
  },


  resizeMap: function(e){
    this.$map.css('height', (this.$el.parent().height() - 64) + "px"); // TODO: parameterize or calculate
    this.map.invalidateSize();
  }

});
