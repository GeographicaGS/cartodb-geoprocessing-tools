'use strict';

App.View.Map = Backbone.View.extend({
  _template: _.template( $('#map_template').html() ),
  id: 'mapview',

  initialize: function(options) {

    this.header = new App.View.Header();
    this.footer = new App.View.Footer();
    this.toolbar = new App.View.MapToolbar();
    
  },

  onClose: function(){
    this.stopListening();
    if (this.header)
      this.header.close();
    if (this.footer)
      this.footer.close();
  },

  render: function(){

    // this.setElement($('main'));
    this.$el.html(this._template());

    this.footer.setElement($('footer'));
    this.header.setElement($('header'));
    this.toolbar.setElement(this.$('.toolbar'));

    this.header.render();
    this.footer.render({classes: ''});
    this.toolbar.render();

    this.$map = this.$('.map');
    this.$map.css('width','100%').css('height', (this.$el.parent().height() - 64) + "px"); // TODO: parameterize or calculate hardcoded toolbar height value (64px)

    var mapOptions = {
      zoom: 5,
      center: [43, 0]
    };
    this.map = new L.Map('map', mapOptions);

    var m = new Backbone.Model({
      map : this.map,
      account: this.model.get('account'),
      viz: this.model.get('viz')
    });
    
    this.groupLayer = new App.View.GroupLayer({
      model : m,
      el: this.$('.layerpanel')
    });
    this.groupLayer.render();

    return this;
  }

});
