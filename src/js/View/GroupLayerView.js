'use strict';

App.View.GroupLayer = Backbone.View.extend({
  _template: _.template( $('#grouplayer-layercontrol_template').html() ),

  events: {
    'click .togglePanel': 'togglePanel'
  },

  initialize: function(options) {
    this._map = options.map;
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){

    this.$el.html(this._template());

    this.$panel = this.$('.panel');
    this.$togglePanelBtn = this.$('.togglePanel');
    this._panelView = new App.View.GroupLayerPanel({el: this.$panel, model : this.model});
    this._mapView = new App.View.GroupLayerMap({model : this.model, map: this._map});
    this._counterView = new App.View.GroupLayerCounter({model: this.model, el: this.$('.title')});

    this._panelView.render();
    this._mapView.render();
    this._counterView.render();

    this.listenTo(this._panelView, 'GroupLayer:forceOpen', function(){this.togglePanel(true);});

    return this;
  },

  togglePanel: function(force) {
    var force = force || false;
    this.$panel.toggleClass('show', force);
    this.$togglePanelBtn.toggleClass('selected', force);
  }

});

App.View.GroupLayerCounter = Backbone.View.extend({
  initialize: function(options){
    this.listenTo(this.model,'change',this.render);
    this.listenTo(this.model,'addSublayer',this.render);
  },
  onClose: function(){
    this.stopListening();
  },
  render: function(){
    var layers = this.model.getSublayers(),
      visible = _.filter(layers, function(l){return l.visible});

    this.$el.html('Layers <span>(' + visible.length + '/' + layers.length + ')</span>');
    return this;
  }
});

App.View.GroupLayerPanel = Backbone.View.extend({

  tagName: 'ul',

  initialize: function(options) {
    this.listenTo(this.model,'addSublayer',this._renderSublayer)
  },

  onClose: function(){
    this.stopListening();
    _.each(this.layers,function(v){
      v.close();
    });
  },

  render: function(){
    var m = this.model.toJSON(),
        _this = this;

    var layers = _.find(m.layers, function(l){ return l.type=='layergroup'}).options.layer_definition.layers;
    this._layers = [];

    for (var i in layers){
      var l = layers[i];
      if (l.remove) continue;
      this._renderSublayer(l);
    };

    var sortableOpts = {
      stop: function(event, ui) {
          _this._refreshLayerOrders();
      }
    }

    this.$el.sortable(sortableOpts);

    return this;
  },

  _renderSublayer: function(l){
    var v = new App.View.GroupLayerPanelLayer({model: new Backbone.Model(l),geoVizModel: this.model});
    this._layers.push(v);
    this.$el.prepend(v.render().$el);
    this.trigger('GroupLayer:forceOpen');
  },

  _refreshLayerOrders:function(e){
    var _this = this;
    var layerList = this.$el.find('li');
    var subLayers = [];
    _.each(layerList.toArray().reverse(), function(l) {
      var gid = $(l).attr('gid');
      if(gid)
        subLayers.push(_this.model.findSublayer(gid));
    });
    this.model.setSublayers(subLayers);
  }

});

App.View.GroupLayerPanelLayer = Backbone.View.extend({

  _template: _.template( $('#grouplayer-layer_template').html() ),

  tagName: 'li',

  initialize: function(options) {
    this._geoVizModel = options.geoVizModel;
    this.listenTo(this.model,'change:visible',this._renderUpdateButton);
    this.listenTo(this.model,'change:geolayer',this.render);
    this.listenTo(this._geoVizModel,'sublayer:change:cartocss',this._sublayerUpdateCartoCSS);
    this.listenTo(this._geoVizModel,'sublayer:ready',this._updateSublayer);
    this.listenTo(this._geoVizModel,'sublayer:failed',this._updateSublayer);
  },

  events: {
    'click a.subviewcontrol': '_toggleSubView',
    'click a.toggle': '_toggle',
    'click a.remove': '_ask_remove',
    'click a.forceremove': '_remove',
    'click a.moreinfo': '_toggleMoreInfo'
  },

  onClose: function(){
    this.stopListening();
  },

  _sublayerUpdateCartoCSS: function(l){
    if (l.gid == this.model.get('gid')){
      this.model.set(l);
    }
  },

  _updateSublayer: function(l){
    if (l.gid == this.model.get('gid')){
      // It's me, let's do something!
      this.model.set('geolayer',l.geolayer);
      this.model.trigger('change:geolayer');
    }
  },

  _toggleSubView: function(e){
    e.preventDefault();

    $(e.currentTarget).parent().children('.selected').removeClass('selected');

    var type = $(e.target).closest('a[data-el]').attr('data-el');
    var suffix;
    if (type == 'wizard')
      suffix = 'Wizard';
    else if (type == 'sql')
      suffix = 'SQL';
    else if (type == 'cartocss')
      suffix = 'CartoCSS';

    var fn = App.View['GroupLayerPanelLayer' + suffix];

    this.$('.subviewholder').get(0).className = 'subviewholder';
    this.$el.removeClass('selected');
    var that = this;
    setTimeout(function(){
      var isInstance = that._subview instanceof fn;
      if(that._subview && isInstance){
        that._subview.close();
        that._subview = null;
      }

      if (!isInstance){
        var prev = that._subview;
        that._subview = new fn({model: that.model,geoVizModel: that._geoVizModel}).render();
        that.$('.subviewholder').html(that._subview.$el).get(0).className = 'subviewholder ' + type;
        that.$el.addClass('selected');
        $(e.currentTarget).addClass('selected');
        if (prev)
          prev.close();
      }
    }, 200);

    return this;
  },

  _toggleMoreInfo: function(e){
    e.preventDefault();
    this.$('.subviewholder').toggleClass('shown');
  },

  _renderUpdateButton: function(){
    var $el = this.$('.toggle');

    if (this.model.get('visible')){
      $el.removeClass('disabled').addClass('enabled');
      this.$el.removeClass('disabled');
    } else {
      $el.removeClass('enabled').addClass('disabled');
      this.$el.addClass('disabled');
    }

    return this;
  },

  _toggle: function(e){
    e.preventDefault();

    this.model.set('visible',!this.model.get('visible'));
    this._geoVizModel.setSublayerVisibility(this.model.get('gid'),this.model.get('visible'));

    return this;

  },

  _ask_remove: function(e){
    e.preventDefault();
    if (!this.model.get('geolayer')) return;

    if(confirm('Are you sure?')){
      this._remove(e);
    }
  },

  _remove: function(e){
    e.preventDefault();
    if (!this.model.get('geolayer')) return;
    this._geoVizModel.removeSublayer(this.model.get('gid'));
    this.close();
  },

  render: function(){

    this.$el.html(this._template({m: this.model.toJSON()}));
    this.$el.attr('gid',this.model.get('gid'));

    if (!this.model.get('geolayer')){
      this.$('.remove').addClass('disabled');
      this.$('a[data-el="wizard"]').addClass('disabled');
    }

    this._renderUpdateButton();
    return this;
  }

});

App.View.GroupLayerPanelLayerWizard = Backbone.View.extend({

  _template: _.template( $('#grouplayer-wizard_template').html() ),
  className: 'wizard',

  initialize: function(options) {
    _.bindAll(this,'_onLayerFields');
    this._geoVizModel = options.geoVizModel;

    this.cartocssModel = App.Model.Wizard.getModelInstance(this.model.get('geometrytype'));

    this.cartocssModel.loadCartoCSS(this.model.get('options').cartocss);

    this.listenTo(this.cartocssModel,'change',this._onChangeCartoCSSField);


  },

  events: {
    'change [name]' : '_onChangeFieldUI'
  },

  _onChangeFieldUI: function(e){
    var $e = $(e.target),
      name = $e.attr('name');

    this.cartocssModel.set(name,$e.val().trim());

  },

  _onChangeCartoCSSField:function(){
    var cartocss = this.cartocssModel.toCartoCSS();

    //this._geoVizModel.updateSubLayerCartoCSS(this.model.get('gid'),cartocss);

    if (this._cartoCSSTimeout)
      clearTimeout(this._cartoCSSTimeout);

    var _this = this;
    this._cartoCSSTimeout = setTimeout(function(){
      clearTimeout(_this._cartoCSSTimeout);
      _this._geoVizModel.updateSubLayerCartoCSS(_this.model.get('gid'),cartocss);
    },500);

  },

  onClose: function(){
    this.stopListening();
  },

  _onLayerFields: function(fields){
    var html = _.map(fields,function(f){
      return '<option value="' + f +'">' + f + '</option>';
    });

    this.$('select[name="text-field"]').append(html);
  },

  render: function(){

    this.$el.html(this._template({
      m: this.model.toJSON(),
      comp_ops: ['multiply','screen','overlay','darken'],
      cartocss: this.cartocssModel.toJSON()
    }));

    this._geoVizModel.getSublayersFields(this.model.get('gid'),this._onLayerFields);


    return this;
  }

});

App.View.GroupLayerPanelLayerCartoCSS = Backbone.View.extend({

  _template: _.template( $('#grouplayer-cartocss_template').html() ),
  className: 'css',

  initialize: function(options) {
    this._geoVizModel = options.geoVizModel;
    _.bindAll(this,'_showClipTooltip');
  },

  events: {
    'click .button.apply' : '_update'
  },

  onClose: function(){
    this.stopListening();
    this._clipboard.destroy();
  },

  render: function(){
    this.$el.html(this._template({m: this.model.toJSON()}));
    if (!this.model.get('geolayer'))
      this.$el.addClass('cartolayer');

    this._clipboard = new Clipboard('.button.copy');
    this._clipboard.on('success', this._showClipTooltip);

    return this;
  },

  _showClipTooltip: function(e){
    var $btn = this.$('.button.copy');
    $btn.addClass('tooltip');

    setTimeout(function(){
      $btn.removeClass('tooltip');
    },1000);

    e.clearSelection();
  },

  _update: function(e){
    e.preventDefault();

    if (!this.model.get('geolayer'))
      return;

    var cartocss = $.trim(this.$('textarea').val());
    this.model.get('options').cartocss = cartocss;
    this._geoVizModel.updateSubLayerCartoCSS(this.model.get('gid'),cartocss);
  }

});

App.View.GroupLayerPanelLayerSQL = Backbone.View.extend({

  _template: _.template( $('#grouplayer-sql_template').html() ),
  className: 'sql',

  initialize: function(options) {
    _.bindAll(this,'_showClipTooltip');
  },

  onClose: function(){
    this.stopListening();
    this._clipboard.destroy();
  },

  _showClipTooltip: function(e){
    var $btn = this.$('.button.copy');
    $btn.addClass('tooltip');

    setTimeout(function(){
      $btn.removeClass('tooltip');
    },1000);

    e.clearSelection();
  },

  render: function(){

    this.$el.html(this._template(this.model.toJSON()));

    this._clipboard = new Clipboard('.button.copy');
    this._clipboard.on('success', this._showClipTooltip);

    return this;
  }

});


App.View.GroupLayerMap = Backbone.View.extend({

  initialize: function(options) {
    _.bindAll(this,'_onLayerDone');

    this._map = options.map;
    this.listenTo(this.model, "change", this.render);
    this.listenTo(this.model, "sublayer:ready", this.render);
  },

  onClose: function(){
    this.stopListening();
  },

  _onLayerDone: function(layer){
    this._layer = layer;
    layer.setInteraction(true);
    layer.on("load", function() {
      $('.cartodb-tiles-loader').animate({opacity: 0}, 400);
    });
  },

  render: function(){

    console.log('Map render!');

    if (this._layer){
      this._layer.hide();
      //this._layer.clear();
      $('.cartodb-infowindow').remove();
      this._map.removeLayer(this._layer);
      //this._layer = null;
    }

    // A Clone is mandatory because createLayer changes the object received.
    // Doesn't work. Clone does a shallow copy
    // var vizjson = this.model.clone().toJSON();
    var vizjson = JSON.parse(JSON.stringify(this.model.toJSON())),
      m = new App.Model.GeoViz(vizjson),
      visibleLayers = m.getLayersForDraw();

    m.setSublayers(visibleLayers, {silent: true});


    $('.cartodb-tiles-loader').animate({opacity: 1}, 400);

    cartodb.createLayer(this._map, m.toJSON())
      .addTo(this._map)
      .on('done',this._onLayerDone)
      .on('error', function(err) {
        console.log("some error occurred: " + err);
      });

    return this;
  }

});
