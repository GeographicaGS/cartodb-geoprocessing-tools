'use strict';

App.View.MapToolbar = Backbone.View.extend({
  _template: _.template( $('#map_toolbar_template').html() ),
  _map: null,

  initialize: function(options) {
    var options = options || {};
    if(options.map)
      this._map = options.map;

    this.listenTo(App.events,'tool:close',this._closeTool)
    // this.layersControl = new App.View.LayerControl();
  },

  events: {
    'click li[data-tool]' : '_openTool'
  },

  onClose: function(){
    this.stopListening();
    this._closeTool();
  },

  _openTool: function(e){
    this.$('.buttons .selected').removeClass('selected');

    var $li = $(e.target).closest('li'),
      type = $li.attr('data-tool'),
      cn;

    if (type == 'clip'){
      cn = 'Clip';
    }
    else if (type == 'intersection'){
      cn = 'Intersection';
    }
     else if (type == 'erase'){
      cn = 'Erase';
    }
    else{
      throw new Error('Unsupported tool type: '+ type);
    }

    var fn = App.View.Tool['Overlay' + cn];
    if (this._tool)
      this._tool.close();

    this._tool = new fn({
      geoVizModel: this.model,
    });

    this.$('.toolholder').html(this._tool.render().$el).show().get(0).className = "toolholder " + type;
    this.$selectedToolBtn = $(e.currentTarget);
    this.$selectedToolBtn.addClass('selected');
  },

  _closeTool: function(){
    this.$('.toolholder').hide();
    this.$('.buttons .selected').removeClass('selected');
    if (this._tool){
      this._tool.close();
      this._tool = null;
    }
  },

  render: function(){
    this.$el.html(this._template());
    // this.layersControl.setElement(this.$('.layers_control'));
    // this.layersControl.render();

    this.groupLayer = new App.View.GroupLayer({
      model : this.model,
      el: this.$('.layers_control'),
      map: this._map
    });
    this.groupLayer.render();

    return this;
  }

});
