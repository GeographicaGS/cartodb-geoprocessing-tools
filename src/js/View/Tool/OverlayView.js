'use strict';

App.View.Tool.Overlay = Backbone.View.extend({
  _template: _.template( $('#tool-overlay_template').html() ),

  initialize: function(options) { 
    this._geoVizModel = options.geoVizModel;
    this.model = new Backbone.Model({
      'input': null,
      'overlay': null,
      'name':null
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
        return $run.addClass('disabled');

    return $run.removeClass('disabled');
    
  },

  _updateModel: function(e){
    var $e = $(e.target),
      name = $e.attr('name'),
      value = $.trim($e.val());

    this.model.set(name,value);

  },

  _runTool: function(e){
    e.preventDefault();

    var $run = $(e.target).closest('a');

    if ($run.hasClass('disabled')|| $run.hasClass('loading'))
      return;
      
    $run.addClass('running');

    var _this = this;
    this.run(function(newLayer){
      this._geoVizModel.addSublayer(newLayer);
      App.events.trigger('tool:close');
    });

  },  

  getOverlayLayers: function(){
    return this._geoVizModel.getSublayers();
  },

  getInputLayers: function(){
    return this._geoVizModel.getSublayers();
  },

  render: function(){

    this.$el.html(this._template({title: this._title}));
    
    // Fill input layer combo
    var inputLayers = this.getInputLayers();
    var $select = this.$('select[name="input"]');
    for (var i in inputLayers){
      $select.append('<option value="' + inputLayers[i].gid + '">' + inputLayers[i].options.layer_name + '</option>');  
    }

    // Fill overlay layers combo
    var overlaylayers = this.getOverlayLayers();

    var $select = this.$('select[name="overlay"]');
    for (var i in overlaylayers){
      $select.append('<option value="' + overlaylayers[i].gid + '">' + overlaylayers[i].options.layer_name + '</option>');  
    }

    return this;
  }

});

App.View.Tool.OverlayClip = App.View.Tool.Overlay.extend({
  initialize: function(options) { 
    _.bindAll(this,'_onSublayersFields');
    this._title = 'Clip';
    App.View.Tool.Overlay.prototype.initialize.apply(this,[options]);
  },

  run: function(cb){
    this._runCB = cb;
    this._geoVizModel.getSublayersFields(this.model.get('input'),this._onSublayersFields);
  },

  _onSublayersFields: function(fields,err){
    if (err)
      throw Error('Cannot get layer fields '+ err);

    var inputlayer = this._geoVizModel.findSublayer(this.model.get('input'));
    var overlaylayer = this._geoVizModel.findSublayer(this.model.get('overlay'));
    
    // Remove geometry fields. We're building it with the clipping
    fields = _.without(fields,'the_geom_webmercator','the_geom');
    fields = _.map(fields,function(f){ return 'a.'+ f});


    // TODO Extract from geometry collections: http://postgis.refractions.net/documentation/manual-2.1SVN/ST_CollectionExtract.html
    var q = [
      " WITH a as ({{{input_query}}}), b as ({{{overlay_query}}}),",
      " r as (",
        "SELECT distinct {{fields}},st_multi(st_intersection(a.the_geom_webmercator,b.the_geom_webmercator)) as the_geom_webmercator",
        " FROM a,b ",
        " WHERE st_intersects(a.the_geom_webmercator,b.the_geom_webmercator)",
      ")",
      " select * from r where st_geometrytype(the_geom_webmercator) ='" +  Utils.getPostgisMultiType(inputlayer.geometrytype) + "'"];

    q = Mustache.render(q.join(' '),{
          input_query: inputlayer.options.sql, 
          overlay_query: overlaylayer.options.sql,
          fields: fields.join(',')
        });

    var newLayer = JSON.parse(JSON.stringify(inputlayer));
    newLayer.options.sql = q;
    newLayer.options.cartocss = "#overlay{ polygon-fill: #FF6600;polygon-opacity: 0.7;line-color: #FFF;line-width: 0.5;line-opacity: 1;}";
    newLayer.options.layer_name = this.model.get('name');
    newLayer.options.geometrytype = inputlayer.geometrytype;
    this._runCB(newLayer);

  },

  getOverlayLayers: function(){
    return this._geoVizModel.getSublayersByGeometryType('polygon');
  }

});

App.View.Tool.OverlayIntersection = App.View.Tool.Overlay.extend({

  initialize: function(options) { 
    this._outputType = false;
    this._title = 'Intersection';
    this._fields = { 'input' : null , 'overlay' : null};
    App.View.Tool.Overlay.prototype.initialize.apply(this,[options]);
  },

  run: function(cb){
    this._runCB = cb;
    this._getFields('input');
    this._getFields('overlay');
  },

  _getFields: function(attr){
    var _this = this;
    this._geoVizModel.getSublayersFields(this.model.get(attr),function(fields){
      if (!fields)
          throw new Error('Cannot get input layer fields');
        
      // Remove geometry fields. We're building it with the clipping
      fields = _.without(fields,'the_geom_webmercator','the_geom');

      _this._fields[attr] = fields;

      if (_this._fields.input && _this._fields.overlay)
        _this._onSublayersFields();

    });
  },

  _mergeFieldsForQuery: function(){
    if (this._fields['input'].indexOf('cartodb_id')!= -1 && this._fields['overlay'].indexOf('cartodb_id')!= -1){
      // CartoDB id is at both layers
      // Let's remove it from the overlay.
      var index = this._fields['overlay'].indexOf('cartodb_id');
      this._fields['overlay'].splice(index, 1);
    }

    // Chose a cartodb_id. Input layer takes precendence over overlay
    var common_fields = _.intersection(this._fields['input'],this._fields['overlay']);
    var input_fields = this._fields['input'];
    var overlay_fields = _.difference(this._fields['overlay'],this._fields['input']);

    input_fields = _.map(input_fields,function(f){
      return 'a.' + f;
    });

    overlay_fields = _.map(overlay_fields,function(f){
      return 'b.' + f;
    });

    overlay_fields = overlay_fields.concat(_.map(common_fields,function(f){
      return 'b.' + f + ' as ' + f + '_2'
    }));

    //var res = input_fields.concat(overlay_fields);
    var res = input_fields;
    return res.join(',');

  },

  _onSublayersFields: function(){
    
    var queryFields = this._mergeFieldsForQuery();

    var inputlayer = this._geoVizModel.findSublayer(this.model.get('input'));
    var overlaylayer = this._geoVizModel.findSublayer(this.model.get('overlay'));

    // TODO Extract from geometry collections: http://postgis.refractions.net/documentation/manual-2.1SVN/ST_CollectionExtract.html
    var q = [
      " WITH a as ({{{input_query}}}), b as ({{{overlay_query}}}),",
      " r as (",
        "SELECT distinct {{fields}},st_multi(st_intersection(a.the_geom_webmercator,b.the_geom_webmercator)) as the_geom_webmercator",
        " FROM a,b ",
        " WHERE st_intersects(a.the_geom_webmercator,b.the_geom_webmercator)",
      ")",
      " select * from r where st_geometrytype(the_geom_webmercator) ='" +  Utils.getPostgisMultiType(inputlayer.geometrytype) + "'"];

    q = Mustache.render(q.join(' '),{
          input_query: inputlayer.options.sql, 
          overlay_query: overlaylayer.options.sql,
          fields: queryFields
        });

    var newLayer = JSON.parse(JSON.stringify(inputlayer));
    newLayer.options.sql = q;
    newLayer.options.cartocss = "#overlay{ polygon-fill: #FF6600;polygon-opacity: 0.7;line-color: #FFF;line-width: 0.5;line-opacity: 1;}";
    newLayer.options.layer_name = this.model.get('name');
    newLayer.options.geometrytype = inputlayer.geometrytype;
    this._runCB(newLayer);

  }

});

App.View.Tool.OverlayStatistical = App.View.Tool.Overlay.extend({
  _template: _.template( $('#tool-overlay_statistical_template').html() ),
  _template_field_options: _.template( $('#tool-overlay_statistical_field_options').html() ),

  initialize: function(options) { 
    // _.bindAll(this,'_onSublayersFields');
    this._outputType = false;
    this._title = 'Statistical report';
    App.View.Tool.Overlay.prototype.initialize.apply(this,[options]);
    this.model.unset('overlay');
    this.reportView = options.reportView;
  },

  events: {
    // 'change [name]' : '_updateModel',
    'change [name="input"]' : '_updateField',
    'change [name="field"]' : '_fieldChange',
    'click a.add': '_addField',
    'click a.remove': '_removeField',
    'click a.run': '_runTool',
    'click a.cancel': '_cancelTool',
  },

  _updateField:function(e){
    var _this = this;
    var $select = this.$('select[name="field"]');
    $select.find('option:not(.choose)').remove()
    this.$('.wraper_field.extra').remove();
    this.$('.wraper_field .options').children().remove();

    this._geoVizModel.getSublayersFields($(e.currentTarget).val(),function(fields,errors){
      _this.currentFields = [];
      _.each(fields, function(f) {
        if(f!='cartodb_id' && f!='the_geom' && f!='the_geom_webmercator'){
          _this.currentFields.push(f);
          $select.append('<option value="' + f + '">' + f + '</option>');  
        }
      });
    });
  },

  _addField:function(e){
    e.preventDefault();
    var options = '';
    _.each(this.currentFields, function(f) {
      options += '<option value="' + f + '">' + f + '</option>'
    });
    this.$('.field_list').append('<div class="wraper_field extra">'
                                  +'  <select name="field">'
                                  +'    <option class="choose">Choose field...</option>'
                                  +     options
                                  +'  </select>'
                                  +'  <a href="#" class="remove"></a>'
                                  +'  <div class="options"></div>'
                                  +'</div>');
  },

  _removeField:function(e){
    e.preventDefault();
    $(e.currentTarget).closest('.wraper_field').remove();
  },

  _fieldChange:function(e){
    var options = $(e.currentTarget).closest('.wraper_field').find('.options');
    if(options.children().length == 0)
      options.html(this._template_field_options());

    this.$('.add').removeClass('hide');
  },

  _runTool: function(cb){
    // var overlaylayer = this._geoVizModel.findSublayer(this.model.get('overlay'));
    var reportModel = new App.Model.Report({account: this.model.get('account')});
    reportModel.set('name',  this.$('#output-name').val());
    reportModel.set('layer', this.$('[name="input"] option:selected').text());
    reportModel.set('layer_sql', this._geoVizModel.findSublayer(this.$('[name="input"]').val()).options.sql);
    reportModel.set('fields',[]);
    _.each(this.$('.field_list .wraper_field'),function(f) {
      var json = {'name':$(f).find('[name="field"]').val(), 'operations':[]};
      _.each($(f).find('input:checked'),function(i) {
        json.operations.push($(i).val());
      });
      reportModel.get('fields').push(json)
    });

    this.reportView.reportCollection.add(reportModel);
    this._geoVizModel.set('reports',this.reportView.reportCollection.toJSON());
    this._geoVizModel.save();
  },

  render: function(){

    this.$el.html(this._template({title: this._title}));
    
    // Fill input layer combo
    var inputLayers = this.getInputLayers();
    var $select = this.$('select[name="input"]');
    for (var i in inputLayers){
      if(!inputLayers[i].geoLayer)
        $select.append('<option value="' + inputLayers[i].gid + '">' + inputLayers[i].options.layer_name + '</option>');  
    }

    return this;
  }

});
