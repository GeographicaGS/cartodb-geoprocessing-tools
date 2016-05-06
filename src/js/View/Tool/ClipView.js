'use strict';

App.View.Tool.Clip = Backbone.View.extend({
  _template: _.template( $('#tool-clip_template').html() ),

  initialize: function(options) { 
    _.bindAll(this,'_onCuttingLayers','_onSublayersFields');
    this._geoVizModel = options.geoVizModel;
    this.model = new Backbone.Model({
      'input': null,
      'cut': null,
      'name':null,
    });
    this.listenTo(this.model,'change',this._updateModelUI);
  },

  events: {
    'click a.cancel': '_cancelTool',
    'click a.run': '_runTool',
    'change [name]' : '_updateModel'
  },

  onClose: function(){
    this.stopListening();
  },

  _cancelTool: function(e){
    e.preventDefault();
    App.events.trigger('tool:close');
  },

  _updateModelUI: function(){

    var m = this.model.toJSON(),
      $run = this.$('.run');
    
    for (var o in m)
      if (!m[o])
        return $run.addClass('disable');

    return $run.removeClass('disable');
    
  },

  _updateModel: function(e){
    var $e = $(e.target),
      name = $e.attr('name'),
      value = $.trim($e.val());

    this.model.set(name,value);

  },

  _runTool: function(e){
    e.preventDefault();

    if ($(e.target).closest('a').hasClass('disable'))
      return;
      
    this._geoVizModel.getSublayersFields(this.model.get('input'),this._onSublayersFields);

  },  

  _onSublayersFields: function(fields,err){
    if (err)
      throw Error('Cannot get layer fields '+ err);

    var inputlayer = this._geoVizModel.findSublayer(this.model.get('input'));
    var cutlayer = this._geoVizModel.findSublayer(this.model.get('cut'));
    
    // Remove geometry fields. We're building it with the clipping
    fields = _.without(fields,'the_geom_webmercator','the_geom');
    fields = _.map(fields,function(f){ return 'a.'+ f});

    var q = [
      ' WITH a as ({{{input_query}}}), b as ({{{cut_query}}})',
      'SELECT distinct {{fields}},st_intersection(a.the_geom_webmercator,b.the_geom_webmercator) as the_geom_webmercator',
        ' FROM a,b WHERE st_intersects(a.the_geom_webmercator,b.the_geom_webmercator)'];

    q = Mustache.render(q.join(' '),{
          input_query: inputlayer.options.sql, 
          cut_query: cutlayer.options.sql,
          fields: fields.join(',')
        });

    var newLayer = JSON.parse(JSON.stringify(inputlayer));
    newLayer.options.sql = q;
    newLayer.options.cartocss = "#clip{ polygon-fill: #FF6600;polygon-opacity: 0.7;line-color: #FFF;line-width: 0.5;line-opacity: 1;}";
    newLayer.options.layer_name = this.model.get('name');
    this._geoVizModel.addSublayer(newLayer);
    App.events.trigger('tool:close');

  },

  render: function(){

    this.$el.html(this._template());
    
    // Fill input layer combo
    var inputLayers = this._geoVizModel.getSublayers();
    var $select = this.$('select[name="input"]');
    for (var i in inputLayers){
      $select.append('<option value="' + inputLayers[i].gid + '">' + inputLayers[i].options.layer_name + '</option>');  
    }

    // Fill cutting layers combo
    this._geoVizModel.getSublayersByGeometryType('polygon',this._onCuttingLayers);

    return this;
      
  },

  _onCuttingLayers: function(layers,err){
    if (err){
      console.error('Cannot get Cutting Layers');
      console.error(err);
      return;
    }

    var $select = this.$('select[name="cut"]');
    for (var i in layers){
      $select.append('<option value="' + layers[i].gid + '">' + layers[i].options.layer_name + '</option>');  
    }
    
  }

});
