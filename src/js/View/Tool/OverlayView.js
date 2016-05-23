'use strict';

App.View.Tool.Overlay = Backbone.View.extend({
  _template: _.template( $('#tool-overlay_template').html() ),

  initialize: function(options) {

    this.model = new Backbone.Model({
      'input': null,
      'overlay': null,
      'name':null
    });
    this._geoVizModel = options.geoVizModel;
    this._titleOverlay = 'Overlay layer';
    this._mergetype = 'hierarchical_up'

    this.listenTo(this.model,'change',this._updateModelUI);
    this.listenTo(this.model,'change:input',this._renderOverlaySelect);


  },

  events: {
    'click a.cancel': '_cancelTool',
    'click a.run': '_runTool',
    'change [name]' : '_updateModel',
    'keyup input[type="text"]' : '_updateModel',
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

    return this;
  },

  getOverlayLayerTypes: function(input){
    var gtypes;
    if (this._mergetype == 'hierarchical_up'){
      if (input.geometrytype=='ST_MultiPolygon' || input.geometrytype=='ST_Polygon'){
        gtypes = ['polygon'];
      }
      else if (input.geometrytype=='ST_MultiLineString' || input.geometrytype=='ST_LineString'){
        gtypes = ['polygon','line'];
      }
      else if (input.geometrytype=='ST_MultiPoint' || input.geometrytype=='ST_Point'){
        gtypes = ['polygon','line','point'];
      }
    }
    else if (this._mergetype == 'sametype'){
      gtypes = [App.Utils.getBaseGeometryType(input.geometrytype)];
    }
    else{
      throw new Error('Unsupported mergetype ' + this._mergetype);
    }

    return gtypes;
  },

  _renderOverlaySelect: function(){

    var input = this._geoVizModel.findSublayer(this.model.get('input'));

    if (!input)
      return;

    var gtypes = this.getOverlayLayerTypes(input);

    var overlaylayers = this._geoVizModel.getSublayersByGeometryType(gtypes);
    // Remove input layers
    overlaylayers = _.without(overlaylayers,input);

    var $select = this.$('select[name="overlay"]');
    var html = '';
    for (var i in overlaylayers){
      html += '<option value="' + overlaylayers[i].gid + '">' + overlaylayers[i].options.layer_name + '</option>';
    }
    $select.html(html);

    this.model.set('overlay',$select.val());

    return this;
  },

  _runTool: function(e){
    e.preventDefault();

    var $run = $(e.target).closest('a');

    if ($run.hasClass('disabled')|| $run.hasClass('running'))
      return;

    $run.addClass('running');

    this.run();

  },

  getOverlayLayers: function(){
    return this._geoVizModel.getSublayers();
  },

  getInputLayers: function(){
    return this._geoVizModel.getSublayers();
  },

  getCartoDBID: function(){
    return 'ROW_NUMBER() OVER () AS cartodb_id';
  },

  render: function(){

    this.$el.html(this._template({title: this._title,title_overlay: this._titleOverlay}));

    // Fill input layer combo
    var inputLayers = this.getInputLayers();
    var $select = this.$('select[name="input"]');
    for (var i in inputLayers){
      $select.append('<option value="' + inputLayers[i].gid + '">' + inputLayers[i].options.layer_name + '</option>');
    }
    // Fill overlay layers combo
    this._renderOverlaySelect();

    return this;
  },

  _getFields: function(attr,cb){
    var _this = this;
    this._geoVizModel.getSublayersFields(this.model.get(attr),function(fields){
      if (!fields)
          throw new Error('Cannot get input layer fields');

      // Remove geometry fields. We're building it with the clipping
      fields = _.without(fields,'the_geom_webmercator','the_geom','cartodb_id');

      _this._fields[attr] = fields;

      if (_this._fields.input && _this._fields.overlay){
        // Both layer fetches. Do the merge

        var common_fields = _.intersection(_this._fields['input'],_this._fields['overlay']);
        var input_fields = _this._fields['input'];
        var overlay_fields = _.difference(_this._fields['overlay'],_this._fields['input']);

        input_fields = _.map(input_fields,function(f){
          return 'a.' + f;
        });

        overlay_fields = _.map(overlay_fields,function(f){
          return 'b.' + f;
        });

        overlay_fields = overlay_fields.concat(_.map(common_fields,function(f){
          return 'b.' + f + ' as ' + f + '_2'
        }));

        var res = input_fields.concat(overlay_fields);
        //var res = input_fields;
        cb(res.join(','));
      }

    });
  },

  mergeFieldsForQuery: function(cb){
    this._fields = {'input' : null, 'left' : null};
    this._getFields('input',cb);
    this._getFields('overlay',cb);
  },

  getFieldsForQuery: function(attr,cb){
    this._geoVizModel.getSublayersFields(this.model.get(attr), function(fields,err){
      if (err)
        throw Error('Cannot get layer fields '+ err);

      var prefix = attr=='input' ? 'a.' : 'b.';
      // Remove geometry fields. We're building it with the clipping
      fields = _.difference(fields,App.Cons.SYSTEM_COLS);
      fields = _.map(fields,function(f){ return prefix + f});

      cb(fields.join(','));
    });
  },

  fieldsRemoveTablePrefix: function(fieldsQuery){
    return _.map(fieldsQuery.split(','),function(f){
      var idx = f.indexOf('.');
      if (idx)
        return f.substring(idx+1);
      else
        return f;
    });
  },

  _getInfoWindowTemplate: function(){
    return '<div class="cartodb-popup v2"><a href="#close" class="cartodb-popup-close-button close">x</a> <div class="cartodb-popup-content-wrapper"> <div class="cartodb-popup-content"> {{#content.fields}} {{#title}}<h4>{{title}}</h4>{{/title}} {{#value}} <p {{#type}}class="{{ type }}"{{/type}}>{{{ value }}}</p> {{/value}} {{^value}} <p class="empty">null</p> {{/value}} {{/content.fields}} </div> </div> <div class="cartodb-popup-tip-container"></div> </div>';
  },

  _fields2alias: function(sqlFields){
    var fields = [];
    var re = new RegExp("(?!\\w+\\s[as])(?!as)([A-Za-z])\\w+","g");
    var result = re.exec(sqlFields);
    while(result !== null) {
      fields.push(result[0]);
      result = re.exec(sqlFields);
    }
    return fields;
  },

  _fields2infowindow: function(sqlFields){
    return _.map(this._fields2alias(sqlFields),function(f,i){
      return {
        name: f,
        position: i+1,
        title: true
      }
    });

  },

  createLayer: function(){
    var newLayer = JSON.parse(JSON.stringify(this._geoVizModel.findSublayer(this.model.get('input'))));
    newLayer.options.sql = this.model.get('sql');
    newLayer.options.cartocss = App.Model.Wizard.getModelInstance(this.model.get('geometrytype')).toCartoCSS();
    newLayer.options.layer_name = this.model.get('name');
    newLayer.options.geometrytype = this.model.get('geometrytype');
    newLayer.visible = true;

    var ifields = this.model.get('infowindow_fields')
    if (ifields && newLayer.infowindow){
      newLayer.infowindow.fields = this._fields2infowindow(ifields);
      newLayer.infowindow.template = this._getInfoWindowTemplate();
    }
    if (!App.Config.Data.DEBUG){
      this._geoVizModel.addSublayer(newLayer);
    }
    else{
      console.log(  newLayer.options.sql );
    }
    App.events.trigger('tool:close');
  },

  queryFields2GroupBy: function(queryFields){
    return _.map(queryFields.split(','),function(f){
      return (f.indexOf(' ')!=-1) ? f : f.split(' ')[0];
    }).join(',');
  },

  toSQL: function(fields){
    return fields ? ',' + fields : '' ;
  }

});

App.View.Tool.OverlayClip = App.View.Tool.Overlay.extend({
  initialize: function(options) {
    App.View.Tool.Overlay.prototype.initialize.apply(this,[options]);
    _.bindAll(this,'_runClip');
    this._title = 'Clip';
    this._titleOverlay = 'Cutting Layer';
  },

  run: function(cb){
    this.getFieldsForQuery('input',this._runClip);
  },

  _runClip: function(queryFields){

    var inputlayer = this._geoVizModel.findSublayer(this.model.get('input'));
    var overlaylayer = this._geoVizModel.findSublayer(this.model.get('overlay'));

    var geometrytype = App.Utils.getPostgisMultiType(inputlayer.geometrytype);
    this.model.set('geometrytype',geometrytype);

    var q = [
      "SELECT (ST_Multi(ST_CollectionExtract(ST_Intersection(a.the_geom,ST_Union(b.the_geom)),{{{geomtype_constant}}}))) AS the_geom{{{fields}}}",
        "FROM ({{{input_query}}}) a",
        "INNER JOIN ({{{overlay_query}}}) b ON ST_Intersects(a.the_geom,b.the_geom)",
        "GROUP BY a.the_geom{{{fields_groupby}}}" ];

    q = Mustache.render(q.join(' '),{
        input_query: inputlayer.options.sql,
        overlay_query: overlaylayer.options.sql,
        fields: this.toSQL(queryFields),
        fields_groupby: this.toSQL(this.queryFields2GroupBy(queryFields)),
        geomtype_constant: App.Utils.getConstantGeometryType(geometrytype),
        geometrytype: geometrytype
    });

    this.model.set({
      'sql':q,
      'infowindow_fields': queryFields,
    });

    this.createLayer();

  }

});

App.View.Tool.OverlayIntersection = App.View.Tool.Overlay.extend({

  initialize: function(options) {
    App.View.Tool.Overlay.prototype.initialize.apply(this,[options]);
    _.bindAll(this,'_runIntersect');
    this._title = 'Intersection';
    this._titleOverlay = 'Intersection Layer';
  },

  run: function(cb){
    this.mergeFieldsForQuery(this._runIntersect);
  },

  _runIntersect: function(queryFields){

    var inputlayer = this._geoVizModel.findSublayer(this.model.get('input'));
    var overlaylayer = this._geoVizModel.findSublayer(this.model.get('overlay'));

    var geometrytype = App.Utils.getPostgisMultiType(inputlayer.geometrytype);

    var q = ["SELECT",
        " CASE WHEN st_geometrytype(the_geom)='ST_GeometryCollection' then ST_CollectionExtract(the_geom,{{geomtype_constant}})",
        " ELSE the_geom",
        " END as the_geom{{{fields2}}}",
      "FROM (",
        "SELECT distinct st_multi(st_intersection(a.the_geom,b.the_geom)) as the_geom{{{fields}}}",
          " FROM ({{{input_query}}}) as a",
          " INNER JOIN ({{{overlay_query}}}) as b ON st_intersects(a.the_geom,b.the_geom)",
        ") as a",
       "WHERE not ST_IsEmpty(the_geom) AND (st_geometrytype(the_geom)='ST_GeometryCollection' OR ",
               "st_geometrytype(the_geom)='{{geometrytype}}')"];

    q = Mustache.render(q.join(' '),{
      input_query: inputlayer.options.sql,
      overlay_query: overlaylayer.options.sql,
      fields: this.toSQL(queryFields),
      fields2: this.toSQL(this.fieldsRemoveTablePrefix(queryFields)),
      geomtype_constant: App.Utils.getConstantGeometryType(geometrytype),
      geometrytype: geometrytype
    });

    this.model.set({
      'geometrytype' : geometrytype,
      'infowindow_fields': queryFields,
      'sql' : q
    });

    this.createLayer();
  }
});

App.View.Tool.OverlayUnion = App.View.Tool.Overlay.extend({

  initialize: function(options) {
    App.View.Tool.Overlay.prototype.initialize.apply(this,[options]);
    _.bindAll(this,'_runUnion');
    this._title = 'Union';
    this._titleOverlay = 'Union Layer';
    this._mergetype = 'sametype';
  },

  run: function(cb){
    this.mergeFieldsForQuery(this._runUnion);
  },

  _runUnion: function(queryFields){

    var inputlayer = this._geoVizModel.findSublayer(this.model.get('input'));
    var overlaylayer = this._geoVizModel.findSublayer(this.model.get('overlay'));

    var geometrytype = App.Utils.getPostgisMultiType(inputlayer.geometrytype),
      gtl = geometrytype.toLowerCase();
    this.model.set('geometrytype',geometrytype);

    var q;

    if (gtl.indexOf('polygon')!= -1){
      // Polygon layer
      q = [
        'with a as ({{{input_query}}}),',
          'b as ({{{overlay_query}}}),',
          // Convert from multipolygon to polygon
          'ap as (',
            'select *,(st_dump(the_geom)).geom from a',
          '),',
          'bp as (',
            'select *,(st_dump(the_geom)).geom from b',
          '),',
          'all_lines as (',
            'select St_ExteriorRing(geom) as geom from ap',
            'union all',
            'select St_ExteriorRing(geom) as geom from bp',
          '),',
          'noded_lines as (',
            'select st_union(geom) as geom from all_lines',
          '),',
          'new_polys as (',
            'select ROW_NUMBER() OVER () AS gid,geom,st_pointonsurface(geom) as pip',
              'from st_dump((',
                'select st_polygonize(geom) as geom from noded_lines',
              '))',
          ')',
          'select p.geom as the_geom{{fields}}',
              'from new_polys p',
              'left join ap a on St_Within(p.pip, a.geom)',
              'left join bp b on St_Within(p.pip, b.geom)'];

      q = Mustache.render(q.join(' '),{
        input_query: inputlayer.options.sql,
        overlay_query: overlaylayer.options.sql,
        fields: this.toSQL(queryFields)
      });

    }
    else if (gtl.indexOf('line')!= -1){

      q = [
      'with a as ({{{input_query}}}),',
        'b as ({{{overlay_query}}}),',
        //put all lines together
        'all_lines as (',
          'select (st_dump(the_geom)).geom  from a',
          'union all',
          'select (st_dump(the_geom)).geom  from b ',
        '),',
        // Get noded lines. Avoid overlapping segments
        'noded_lines as (',
          'select st_union(geom) as geom from all_lines',
        '),',
        // Decompose back again
        'non_intersect_lines as (',
          'select distinct (st_dump(geom)).geom from noded_lines',
        ')',
        // Get attributes using left join + st_within
        'select l.geom as the_geom{{fields}}',
         'from non_intersect_lines l',
         'left join a on st_within(l.geom,a.the_geom)',
         'left join b on st_within(l.geom,b.the_geom)'];

      q = Mustache.render(q.join(' '),{
        input_query: inputlayer.options.sql,
        overlay_query: overlaylayer.options.sql,
        fields: this.toSQL(queryFields)
      });

      this.model.set('geometrytype','ST_LineString');

    }
    else if (gtl.indexOf('point')!= -1){

      q = [
      'with a as ({{{input_query}}}),',
        'b as ({{{overlay_query}}}),',
        //put all points together
        'all_points as (',
          'select (st_dump(the_geom)).geom  from a',
          'union',
          'select (st_dump(the_geom)).geom  from b ',
        ')',
        'select p.geom as the_geom{{fields}}',
           'from all_points p',
           'left join a on st_intersects(p.geom,a.the_geom)',
           'left join b on st_intersects(p.geom,b.the_geom)'];


      q = Mustache.render(q.join(' '),{
        input_query: inputlayer.options.sql,
        overlay_query: overlaylayer.options.sql,
        fields: this.toSQL(queryFields)
      });

      this.model.set('geometrytype','ST_Point');

    }
    else{
      throw new Error('Union: unsupported '+ geometrytype);
    }

    this.model.set({
      'infowindow_fields': queryFields,
      'sql' : q
    });

    this.createLayer();
  }

  // getFieldsUnion: function(queryFields,prefix){
  //   var fields = queryFields.split(',');
  //
  //   var r = _.map(fields,function(f){
  //     if (f.startsWith(prefix)){
  //       return f;
  //     }
  //     else{
  //       // It's an alias.
  //       var alias = f.indexOf(' as ')!=-1;
  //
  //       if (alias){
  //         return 'null as ' + f.substring(f.indexOf(' ')).replace(' as ','');
  //       }
  //       else{
  //         return 'null as ' + f.substring(f.indexOf('.') + 1 );
  //       }
  //     }
  //   });
  //  return r.join(',');
  //}
});

App.View.Tool.OverlayErase = App.View.Tool.Overlay.extend({
  initialize: function(options) {

    App.View.Tool.Overlay.prototype.initialize.apply(this,[options]);

    _.bindAll(this,'_runErase');
    this._title = 'Erase';
    this._titleOverlay = 'Erase Layer';

  },

  run: function(cb){
    this.getFieldsForQuery('input',this._runErase);
  },

  _runErase: function(queryFields,err){
    if (err)
      throw Error('Cannot get layer fields '+ err);

    var inputlayer = this._geoVizModel.findSublayer(this.model.get('input'));
    var overlaylayer = this._geoVizModel.findSublayer(this.model.get('overlay'));

    var geometrytype = inputlayer.geometrytype,
      gtl = geometrytype.toLowerCase();

    if (gtl.indexOf('point') != -1){
      // Point erase. Use subqueries. AVOID CTE (WITH clause) BECAUSE OF PERFORMANCE!!!
      var q = [
          'select a.the_geom{{fields}} from ({{{input_query}}}) a',
            'left join ({{{overlay_query}}}) b on st_intersects(a.the_geom,b.the_geom)',
          'where b.the_geom is null'];

      q = Mustache.render(q.join(' '),{
          input_query: inputlayer.options.sql,
          overlay_query: overlaylayer.options.sql,
          fields: this.toSQL(queryFields)
      });

      this.model.set('geometrytype',geometrytype);

    }
    else{
      var geometrytype = App.Utils.getPostgisMultiType(geometrytype);
      this.model.set('geometrytype',geometrytype);

      var q = [
        "SELECT distinct ",
              " CASE WHEN st_geometrytype(the_geom)='ST_GeometryCollection' then ST_CollectionExtract(the_geom,{{geomtype_constant}})",
              " ELSE the_geom",
              " END as the_geom{{fields}}",
        "FROM (",
          "SELECT st_multi(ST_Difference(a.the_geom,ST_Union(b.the_geom))) AS the_geom{{fields}}",
           "FROM ({{{input_query}}}) a",
           "INNER JOIN ({{{overlay_query}}}) b ON ST_Intersects(a.the_geom, b.the_geom)",
           "GROUP BY a.the_geom{{fields_groupby}}",
        ") a",
        "where not st_isempty(the_geom) and st_geometrytype(the_geom)='{{geometrytype}}'",

        "UNION ALL",

        "SELECT distinct st_multi(a.the_geom) as the_geom{{fields}} FROM ({{{input_query}}}) a",
          "left join ({{{overlay_query}}}) b  on ST_Intersects(a.the_geom, b.the_geom)",
          "where b.the_geom is null"
      ];

      q = Mustache.render(q.join(' '),{
          input_query: inputlayer.options.sql,
          overlay_query: overlaylayer.options.sql,
          fields: this.toSQL(queryFields),
          fields_groupby: this.toSQL(this.queryFields2GroupBy(queryFields)),
          geomtype_constant: App.Utils.getConstantGeometryType(geometrytype),
          geometrytype: geometrytype
      });

    }

    this.model.set({
      'sql' : q
    });

    this.createLayer();

  }
});
