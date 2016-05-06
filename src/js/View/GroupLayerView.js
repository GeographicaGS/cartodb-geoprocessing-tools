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
    var layers = _.find(this.model.get('layers'), function(l){ return l.type=='layergroup'}).options.layer_definition.layers;
    var visible = _.filter(layers, function(l){return l.visible});

    this.$el.html(this._template({total: layers.length, visible: visible.length}));

    this.$panel = this.$('.panel');
    this.$togglePanelBtn = this.$('.togglePanel');
    this._panelView = new App.View.GroupLayerPanel({el: this.$panel, model : this.model});
    this._mapView = new App.View.GroupLayerMap({model : this.model, map: this._map});

    this._panelView.render();
    this._mapView.render();

    return this;
  },

  togglePanel: function() {
    this.$panel.toggleClass('show');
    this.$togglePanelBtn.toggleClass('selected');
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
      if (l.remove)
        continue;
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
  className: 'wizard',

  initialize: function(options) {
    this._geoVizModel = options.geoVizModel;
    this.listenTo(this.model,'change:geometrytype',this.render);
  },

  onClose: function(){
    this.stopListening();
  },

  _checkGeometryType: function(){
    var sql = new cartodb.SQL({ user: this._geoVizModel.get('account') });
    var q = "WITH q as ({{sql}}) select st_geometrytype(the_geom_webmercator) as geometrytype from q LIMIT 1";

    var _this = this;
    sql.execute(q,{sql: this.model.get('options').sql},{cache:false})
      .done(function(data) {
        if (data.rows.length && data.rows[0].geometrytype)
          _this.model.set('geometrytype',data.rows[0].geometrytype);
        else
          _this.model.set('geometrytype','nodata');
      })
      .error(function(errors) {
        _this.model.set('geometrytype','error');
        console.log(errors);
      });
  },

  render: function(){
    // Check layer type. Is it a polygon, line or point?
    var geometrytype = this.model.get('geometrytype'),
      opts = {};
    if (geometrytype){
      opts.geometrytype = geometrytype;
      opts.loading = false;
    }
    else{
      opts.loading = true;
      // Async request. It will fire a render again
      this._checkGeometryType();
    }

    this.$el.html(this._template(opts));
    return this;
  }

});

App.View.GroupLayerPanelLayerCartoCSS = Backbone.View.extend({

  _template: _.template( $('#grouplayer-cartocss_template').html() ),
  className: 'css',

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
  className: 'sql',

  initialize: function(options) {

  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){

    this.$el.html(this._template(this.model.toJSON().options));
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
