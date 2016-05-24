'use strict';

App.View.MapToolbar = Backbone.View.extend({
  _template: _.template( $('#map_toolbar_template').html() ),
  _map: null,

  initialize: function(options) {
    var options = options || {};
    if(options.map)
      this._map = options.map;

    if(options.vis)
      this._vis = options.vis;

    this._readonly = options.readonly;

    this._userModel = App.getUserModel();

    this.listenTo(App.events,'tool:close',this._closeTool)
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
    this.$('.buttons .selected:not(#reportBtn):not(#layersBtn)').removeClass('selected');

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
      this._removeToolWidget();
      var _this = this;
      setTimeout(function () {
        _this._createToolWidget(fn, cn, type, e.currentTarget);
      }, 500);
    }else{
      this._createToolWidget(fn, cn, type, e.currentTarget);
    }

  },

  _closeTool: function(){
    this.$('.toolholder').get(0).className = "toolholder";
    this.$('.buttons .selected:not(#reportBtn):not(#layersBtn)').removeClass('selected');
    this._currentCn = null;
    this._removeToolWidget();
  },

  _createToolWidget: function(fn, cn, type, button){
    if(this._currentCn != cn || (cn == 'Measure' && this._tool && this._type != $(button).attr('type'))){

      this._tool = new fn({
        geoVizModel: this.model,
        reportView: cn == 'Statistical' ? this.reportView: null,
        parentView: (cn == 'Statistical') ? this: null,
        map: (cn == 'Measure' || cn=='Bookmarks') ? this._map: null,
        vis: (cn == 'Measure') ? this._vis: null,
        type: (cn == 'Measure') ? $(button).attr('type'): null
      });

      this._currentCn = cn;

      this.$('.toolholder').html(this._tool.render().$el).get(0).className = "toolholder shown " + type;

      this.$selectedToolBtn = $(button);
      this.$selectedToolBtn.addClass('selected');
    }else{
      this._currentCn = null;
    }
  },

  _removeToolWidget: function(){
    var _this = this;
    this._tool.$el.parent().get(0).className = "toolholder";
    setTimeout(function () {
      if (_this._tool){
        _this._tool.close();
        _this._tool = null;
      }
    }, 250);
  },

  _openReportList:function(e){
    $(e.currentTarget).toggleClass('selected');
    $(e.currentTarget).closest('.map_extra_controls').toggleClass('translated');
    $('.cartodb-zoom').toggleClass('translated');
    $('.cartodb-logo').toggleClass('translated');
    $('#mapview .map-options').toggleClass('translated');
    $('.left-sidebar').toggleClass('activated');
  },

  render: function(){

    this.$el.html(this._template({readonly: this._readonly}));
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
      $('.cartodb-logo').addClass('translated');
      $('#mapview .map-options').addClass('translated');
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
