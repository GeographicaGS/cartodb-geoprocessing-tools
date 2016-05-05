'use strict';

App.View.GroupLayer = Backbone.View.extend({
  
  initialize: function(options) {
    this._map = options.map;
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){

    this._panelView = new App.View.GroupLayerPanel({model : this.model});
    this._mapView = new App.View.GroupLayerMap({model : this.model, map: this._map});

    this.$el.html(this._panelView.render().$el);
    this._mapView.render();

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
    'click a.subviewcontrol': '_toggleSubView',
    'click a.toggle': '_toggle',
    'click a.remove': '_remove'
  },

  onClose: function(){
    this.stopListening();
  },
  
  _toggleSubView: function(e){
    e.preventDefault();
    var type = $(e.target).closest('a[data-el]').attr('data-el');
    
    var suffix;
    if (type == 'wizard')
      suffix = 'Wizard';
    else if (type == 'sql')
      suffix = 'SQL';
    else if (type == 'cartocss')
      suffix = 'CartoCSS';

    var fn = App.View['GroupLayerPanelLayer' + suffix];

    if (this._subview instanceof fn){
      this._subview.close();
      this._subview = null;
    }
    else{
      var prev = this._subview;
      this._subview = new fn({model: this.model,geoVizModel: this._geoVizModel}).render();
      this.$('.subviewholder').html(this._subview.$el);
      if (prev)
        prev.close();
    }
    
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
    this.$el.html(this._template(this.model.toJSON().options));
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
    this._geoVizModel = options.geoVizModel;
  },

  events: {
    'click input[type="button"]' : '_update'
  },
 
  onClose: function(){
    this.stopListening();
  },
  
  render: function(){
    this.$el.html(this._template(this.model.toJSON().options));
    return this;
  },

  _update: function(e){
    e.preventDefault();

    var cartocss = $.trim(this.$('textarea').val());
    this.model.get('options').cartocss = cartocss;
    this._geoVizModel.updateSubLayerCartoCSS(this.model.get('id'),cartocss);
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


