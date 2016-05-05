'use strict';

App.View.GroupLayer = Backbone.View.extend({
  
  initialize: function(options) {

    _.bindAll(this,'_onFetchVizModel');
    this._map = this.model.get('map');

    this._user = new App.Model.UserLocalStorage();

    this._cartoVizModel = new App.Model.CartoViz({
      id: this.model.get('viz'),
      account: this.model.get('account')
    });

    this._geoVizModel = new App.Model.GeoViz({
      id: this.model.get('viz'),
      account: this.model.get('account')
    });

  },

  onClose: function(){
    this.stopListening();
  },

  _onFetchVizModel: function(m){
    this._nfetches++;

    if (this._nfetches==2){
      // Both models fetched. Let's do the merge
      this._mergeViz();
    }
  },

  _mergeViz: function(){

    if (!this._geoVizModel.get('layers'))
        this._geoVizModel = new App.Model.GeoViz(this._cartoVizModel.toJSON());

    if (this._user.get('autosave') && this._user.get('account')==this._geoVizModel.get('account'))
      this._geoVizModel.save();

    this._panelView = new App.View.GroupLayerPanel({model : this._geoVizModel});
    this._mapView = new App.View.GroupLayerMap({model : this._geoVizModel, map: this._map});

    this.$el.html(this._panelView.render().$el);
    this._mapView.render();
    
  },
  
  render: function(){

    // Everything start after fetching models.
    this._nfetches = 0;

    this._cartoVizModel.fetch({
      success: this._onFetchVizModel
    });

    this._geoVizModel.fetch({
      success: this._onFetchVizModel
    });

    return this;
  }

});

App.View.GroupLayerPanel = Backbone.View.extend({

  tagName: 'ul',
  
  initialize: function(options) {
    
  },

  onClose: function(){
    this.stopListening();
    _.each(this.layers,function(v){
      v.close();
    });
  },
  
  render: function(){
    var m = this.model.toJSON();
    
    var layers = _.find(m.layers, function(l){ return l.type=='layergroup'}).options.layer_definition.layers;
    this._layers = [];
    
    for (var i in layers){
      var l = layers[i];
      var v = new App.View.GroupLayerPanelLayer({model: new Backbone.Model(l),geoVizModel: this.model});
      this._layers.push(v);
      this.$el.prepend(v.render().$el);
    };
    
    return this;
  }

});

App.View.GroupLayerPanelLayer = Backbone.View.extend({

  _template: _.template( $('#grouplayer-layer_template').html() ),

  tagName: 'li',
  
  initialize: function(options) {
    this._geoVizModel = options.geoVizModel;
    this.listenTo(this.model,'change:visible',this._renderUpdateButton);
  },

  events: {
    'click a.subviewcontrol': '_openSubView',
    'click a.toggle': '_toggle',
    'click a.remove': '_remove'
  },

  onClose: function(){
    this.stopListening();
  },
  
  _openSubView: function(e){
    e.preventDefault();
    var type = $(e.target).closest('a[data-el]').attr('data-el');
    var prev = this._subview;
    
    var suffix;
    if (type == 'wizard')
      suffix = 'Wizard';
    else if (type == 'sql')
      suffix = 'SQL';
    else if (type == 'cartocss')
      suffix = 'CartoCSS';

    var fn = App.View['GroupLayerPanelLayer' + suffix];
    this._subview = new fn({model: this.model}).render();
    this.$('.subviewholder').html(this._subview.$el);

    if (prev)
      prev.close();

    return this;

  },

  _renderUpdateButton: function(){
    var $el = this.$('.toggle');

    if (this.model.get('visible'))
      $el.removeClass('disable').addClass('enable');
    else
      $el.removeClass('enable').addClass('disable');

    return this;
  },

  _toggle: function(e){
    e.preventDefault();

    this.model.set('visible',!this.model.get('visible'));
    this._geoVizModel.setSublayerVisibility(this.model.get('id'),this.model.get('visible'));

    return this;

  },

  _remove: function(e){
    e.preventDefault();

    if(confirm('Are you sure?')){
      this._geoVizModel.removeSublayer(this.model.get('id'));
      this.close();
    }
  },

  render: function(){
    var m = this.model.toJSON();
    this.$el.html(this._template(m.options));
    this._renderUpdateButton();
    return this;
  }

});

App.View.GroupLayerPanelLayerWizard = Backbone.View.extend({

  _template: _.template( $('#grouplayer-wizard_template').html() ),

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

App.View.GroupLayerPanelLayerCartoCSS = Backbone.View.extend({

  _template: _.template( $('#grouplayer-cartocss_template').html() ),

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

App.View.GroupLayerPanelLayerSQL = Backbone.View.extend({

  _template: _.template( $('#grouplayer-sql_template').html() ),

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


App.View.GroupLayerMap = Backbone.View.extend({
  
  initialize: function(options) {
    _.bindAll(this,'_onLayerDone');

    this._map = options.map;  
    this.listenTo(this.model, "change", this.render);
  },

  onClose: function(){
    this.stopListening();
  },
  
  _onLayerDone: function(layer){
    this._layer = layer;
  },

  render: function(){

    console.log('Map render!');

    if (this._layer){
      this._map.removeLayer(this._layer);
    }
    
    // A Clone is mandatory because createLayer changes the object received.
    // Doesn't work. Clone does a shallow copy
    // var vizjson = this.model.clone().toJSON();
    var vizjson = JSON.parse(JSON.stringify(this.model.toJSON()));

    cartodb.createLayer(this._map, vizjson)
      .addTo(this._map)
      .on('done',this._onLayerDone)
      .on('error', function(err) {
        console.log("some error occurred: " + err);
      });
    
    return this;
  }

});


