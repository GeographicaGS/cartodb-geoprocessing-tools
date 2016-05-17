App.View.Tool.Statistical = Backbone.View.extend({
  _template: _.template( $('#tool-statistical_template').html() ),
  _template_field_options: _.template( $('#tool-statistical_field_options').html() ),

  initialize: function(options) {
    this._outputType = false;
    this._title = 'Statistical report';
    App.View.Tool.Overlay.prototype.initialize.apply(this,[options]);
    this.model.unset('overlay');
    this.reportView = options.reportView;
    this._parentView = options.parentView;
  },

  events: {
    'change [name="input"]' : '_updateField',
    'change [name="field"]' : '_fieldChange',
    'click a.add': '_addField',
    'click a.remove': '_removeField',
    'click a.run': '_runTool',
    'click a.cancel': '_cancelTool',
    'keyup [name]' : '_checkFields',
    'change select' : '_checkFields',
    'click input[type="checkbox"]' : '_checkFields',
    'click .button.notfilled.cancel' : '_closeTool',
  },

  onClose: function(){
    this.stopListening();
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
                                  +' <div>'
                                  +'  <select name="field">'
                                  +'    <option class="choose">Choose field...</option>'
                                  +     options
                                  +'  </select>'
                                  +'  <a href="#" class="remove"></a>'
                                  +' </div>'
                                  +'  <div class="options"></div>'
                                  +'</div>');
    this._checkFields();
  },

  _removeField:function(e){
    e.preventDefault();
    $(e.currentTarget).closest('.wraper_field').remove();
    this._checkFields();
  },

  _fieldChange:function(e){
    var options = $(e.currentTarget).closest('.wraper_field').find('.options');
    if(options.children().length == 0)
      options.html(this._template_field_options());

    this.$('.add').removeClass('hide');
  },

  _runTool: function(cb){
    if(!this.$('.run').hasClass('disabled')){
      var reportModel = new App.Model.Report();
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
    }
  },

  _checkFields:function(){
    var enable = true;
    if(this.$('#output-name').val() == '')
      enable = false;

    if(this.$('select[name=input]') == 'Choose field...')
      enable = false;

    var fields = this.$('.wraper_field');
    _.each(fields,function(f) {
      if($(f).find('select[name=field]').val() == 'Choose field...')
        enable = false;
      if($(f).find('.options').length == 0 ||  $(f).find('.options input[type=checkbox]:checked').length == 0)
        enable = false;
    });

    if(enable)
      this.$('.run').removeClass('disabled');
    else
      this.$('.run').addClass('disabled');

  },

  _closeTool:function(e){
    e.preventDefault();
    this._parentView._closeTool();
  },

  render: function(){

    this.$el.html(this._template({title: this._title}));

    var inputLayers = this._geoVizModel.getSublayers();;
    var $select = this.$('select[name="input"]');
    for (var i in inputLayers){
      if(!inputLayers[i].geoLayer)
        $select.append('<option value="' + inputLayers[i].gid + '">' + inputLayers[i].options.layer_name + '</option>');
    }

    return this;
  }

});
