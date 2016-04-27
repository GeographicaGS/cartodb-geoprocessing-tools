'use strict';

App.View.Map = Backbone.View.extend({
  _template: _.template( $('#map_template').html() ),

  id: 'map',

  initialize: function(options) {
    this.header = new App.View.Header();
    this.footer = new App.View.Footer();
    this.toolbar = new App.View.MapToolbar();
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template());

    this.footer.setElement($('footer'));
    this.header.setElement($('header'));
    this.toolbar.setElement(this.$('.toolbar'));

    this.header.render();
    this.footer.render();
    this.toolbar.render();

    this.$el.css('width','100%').css('height','500px');
    cartodb.createVis('map', App.Config.viz_api_url('documentation') + '/' + this.model.get('viz') + '/viz.json');

    return this;
  }

});
