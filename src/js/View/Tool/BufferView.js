'use strict';

App.View.Tool.Buffer = Backbone.View.extend({
  _template: _.template( $('#tool-buffer_template').html() ),

  initialize: function(options) { 
    this._geoVizModel = options.geoVizModel;
  },

  events: {
    'click a.cancel': '_cancelTool',
    'click a.run': '_runTool'
  },

  onClose: function(){
    this.stopListening();
  },

  _cancelTool: function(e){
    e.preventDefault();
    App.events.trigger('tool:close');
  },

  render: function(){
    this.$el.html(this._template({title: this._title}));
    return this;
  }

});