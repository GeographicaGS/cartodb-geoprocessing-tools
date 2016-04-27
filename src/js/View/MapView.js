'use strict';

App.View.Map = Backbone.View.extend({
  _template: _.template( $('#map_template').html() ),

  initialize: function(options) {
    this.header = new App.View.Header();
    this.footer = new App.View.Footer();
    this.toolbar = new App.View.MapToolbar();
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    this.setElement($('main'));
    this.$el.html(this._template());

    this.footer.setElement($('footer'));
    this.header.setElement($('header'));
    this.toolbar.setElement(this.$('.toolbar'));

    this.header.render();
    this.footer.render();
    this.toolbar.render();
    this.map = this.$('.map');
    this.map.css('width','100%').css('height', (this.$el.height() - 64) + "px"); // TODO: parameterize or calculate hardcoded toolbar height value (64px)
    cartodb.createVis(this.map, App.Config.viz_api_url('documentation') + '/' + this.model.get('viz') + '/viz.json',{
      fullscreen: false
    });

    return this;
  }

});
