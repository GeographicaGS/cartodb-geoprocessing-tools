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
    'click li[data-tool]' : '_openTool',
    'click .map_extra_controls .tooltip' : '_openReportList'
  },

  onClose: function(){
    this.stopListening();
    this._closeTool();

    if(this.reportView)
      this.reportView.close();
  },

  _openTool: function(e){
    this.$('.buttons .selected').removeClass('selected');

    var $li = $(e.target).closest('li'),
      type = $li.attr('data-tool'),
      cn;

    if (type == 'clip'){
      cn = 'OverlayClip';
    }
    else if (type == 'intersection'){
      cn = 'OverlayIntersection';
    }
    else if (type == 'erase'){
      cn = 'OverlayErase';
    }
    else if (type == 'union'){
      cn = 'OverlayUnion';
    }
    else if (type == 'buffer'){
      cn = 'Buffer';
    }
    else if (type == 'statistical'){
      cn = 'Statistical';
    }
    else if (type == 'measure'){
      cn = 'Measure';
    }
    else if (type == 'bookmarks'){
      cn = 'Bookmarks';
    }
    else{
      throw new Error('Unsupported tool type: '+ type);
    }

    var fn = App.View.Tool[cn];

    if (this._tool){
      this._tool.close();
      this.$('.toolholder').get(0).className = "toolholder";
    }

    if(this._currentCn != cn){

      this._tool = new fn({
        geoVizModel: this.model,
        reportView: cn == 'Statistical' ? this.reportView: null,
        map: (cn == 'Measure' || cn=='Bookmarks') ? this._map: null
      });

      this._currentCn = cn;

      this.$('.toolholder').html(this._tool.render().$el).get(0).className = "toolholder shown " + type;
      this.$selectedToolBtn = $(e.currentTarget);
      this.$selectedToolBtn.addClass('selected');

    }else{
      this._currentCn = null;
    }
  },

  _closeTool: function(){
    this.$('.toolholder').get(0).className = "toolholder";
    this.$('.buttons .selected').removeClass('selected');
    this._currentCn = null;
    if (this._tool){
      this._tool.close();
      this._tool = null;
    }
  },

  _openReportList:function(e){
    $(e.currentTarget).toggleClass('selected');
    $(e.currentTarget).closest('.map_extra_controls').toggleClass('translated');
    $('.cartodb-zoom').toggleClass('translated');
    $('.left-sidebar').toggleClass('activated');
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

    this.reportView = new App.View.Report({'map':this._map, geoVizModel: this.model});
    this.reportView.setElement($('.left-sidebar'));
    this.reportView.render();
    this.listenTo(this.reportView.reportCollection,'add', function(){
      this.$('.map_extra_controls .tooltip').addClass('selected');
      this.$('.map_extra_controls .tooltip').closest('.map_extra_controls').addClass('translated');
      $('.cartodb-zoom').addClass('translated');
      $('.left-sidebar').addClass('activated');
      this._closeTool();
    });

    this.listenTo(this.reportView, 'open_statistical', function(){
      if(!this._tool || !this._tool._title == 'Statistical report')
        this.$('[data-tool=statistical]').trigger('click');
    });

    return this;
  }

});
