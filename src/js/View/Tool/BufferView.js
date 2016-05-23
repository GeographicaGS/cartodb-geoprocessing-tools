'use strict';

App.View.Tool.Buffer = Backbone.View.extend({
  _template: _.template( $('#tool-buffer_template').html() ),

  initialize: function(options) {

    this.model = new App.Model.Tool.Buffer();
    this._geoVizModel = options.geoVizModel;

    this.listenTo(this.model,'change',this._updateModelUI);
    this.listenTo(this.model,'change:input',this._changeInput);
    this.listenTo(this.model,'change:type',this._changeType);

  },

  events: {
    'click a.cancel': '_cancelTool',
    'click a.run': '_run',
    'change .modelattr' : '_updateModel',
    'keyup .modelattr.keyup' : '_updateModel',
    'click a.run': '_run',
  },

  onClose: function(){
    this.stopListening();
  },

  _updateModel: function(e){
    var $e = $(e.target),
      name = $e.attr('name'),
      value;

    if ($e.attr("type")=="checkbox"){
      value = $e.is(':checked');
    }
    else{
      value = $.trim($e.val());
    }

    this.model.set(name,value);

    return this;
  },

  _changeType: function(){
    this.$('[data-type]').addClass('hide');
    this.$('[data-type="'+ this.model.get('type') + '"]').removeClass('hide');
  },

  _updateModelUI: function(){

    var m = this.model.toJSON(),
      $run = this.$('.run');

    for (var o in m){

      if (['input','name','type','unit'].indexOf(o)!=-1){
        //Basic types
        if (!m[o])
          return $run.addClass('disabled');
      }
      else{
        // Not basic types
        var type = m['type'];

        if (type == 'input' && o == 'type_input' && !m[o]){
          // type=input && type_input=null
          return $run.addClass('disabled');
        }
        if (type == 'field' && o == 'type_field' && !m[o]){
          // type=field && type_field = null
          return $run.addClass('disabled');
        }
      }
    }

    return $run.removeClass('disabled');

  },

  _cancelTool: function(e){
    e.preventDefault();
    App.events.trigger('tool:close');
  },

  _changeInput: function(){
    this.model.set('fields',null);
    var input = this.model.get('input');
    if (!input)
      return;

    // reset
    var defaults = this.model.defaults;
    delete defaults.input;
    this.model.set(defaults);
    this.render();

    var _this = this;
    this._geoVizModel.getSublayersFields2(this.model.get('input'), function(fields,err){
      if (err)
        throw Error('Cannot get layer fields '+ err);

      fields = _.omit(fields,'the_geom_webmercator','the_geom');
      _this.model.set('fields',_.allKeys(fields).join(','));

      var numfields = _this._geoVizModel.filterFieldsByType(fields,'number');
      numfields = _.without(numfields,'cartodb_id');
      var $field = _this.$('select[name="type_field"]');
      var html = '';
      for (var i in numfields){
        html += '<option value="' + numfields[i] + '">' + numfields[i] + '</option>';
      }
      $field.append(html);
    });

  },

  render: function(){
    this.$el.html(this._template({m: this.model.toJSON(),inputLayers: this._geoVizModel.getSublayers({only_ready: true})}));
    return this;
  },

  _reliableRun: function(){
    var input = this._geoVizModel.findSublayer(this.model.get('input'));

    var q;

    if (!this.model.get('disolve')){

      q = [
        ' WITH a as ({{{input_query}}})',
        ' SELECT st_multi(',
          'st_transform(st_buffer(the_geom::geography,{{buffer_size}})::geometry,3857)) as the_geom_webmercator{{{fields}}}',
        ' FROM a'
      ];
    }
    else{
      q = [
        ' WITH a as ({{{input_query}}}),',
        ' buffer as (',
          'SELECT st_multi(',
            'st_transform(st_buffer(the_geom::geography,{{buffer_size}})::geometry,3857)) as the_geom_webmercator',
          'FROM a',
        ')',
        ' SELECT st_multi(st_union(the_geom_webmercator)) as the_geom_webmercator from buffer'
      ];
    }

    var buffer_size;

    if ( this.model.get('type') == 'input'){
      buffer_size = this.model.get('type_input');

      if (this.model.get('unit') == 'km')
        buffer_size *= 1000;
    }
    else{
      buffer_size = this.model.get('type_field');
    }

    q = Mustache.render(q.join(' '),{
      input_query: input.options.sql,
      buffer_size : buffer_size,
      fields: this.model.get('fields') ? ',' + this.model.get('fields') : ''
    });

    var newLayer = JSON.parse(JSON.stringify(input));
    newLayer.options.sql = q;
    newLayer.options.cartocss = App.Model.Wizard.getModelInstance('ST_MultiPolygon').toCartoCSS();
    newLayer.options.layer_name = this.model.get('name');

    if (this.model.get('disolve')){
      newLayer.infowindow = null;
    }

    newLayer.geometrytype = 'ST_MultiPolygon';
    newLayer.visible = true;

    this._geoVizModel.addSublayer(newLayer);
    App.events.trigger('tool:close');
  },

  _run: function(){
    if(!this.$('.run').hasClass('disabled')){
      if (!this.model.get('fields')){
        // Getting fields. It's odd but could happens.
        this.listenToOnce(this.model,'change:fields',this._reliableRun);
      }
      else{
        this._reliableRun();
      }
    }
  }

});
