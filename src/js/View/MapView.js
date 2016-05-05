'use strict';

App.View.Map = Backbone.View.extend({
  _template: _.template( $('#map_template').html() ),
  id: 'mapview',

  initialize: function(options) {

    _.bindAll(this,'_onFetchVizModel');

    this.header = new App.View.Header();
    this.footer = new App.View.Footer();

    this._user = new App.Model.UserLocalStorage();

  },

  onClose: function(){
    this.stopListening();
    if (this.header)
      this.header.close();
    if (this.footer)
      this.footer.close();
  },

  _onFetchVizModel: function(m){
    this._nfetches++;

    if (this._nfetches==2){
      // Both models fetched. Let's do the merge
      this._mergeViz();
    }
  },

  _mergeViz: function(){

    if (!this._geoVizModel.get('layers'))
        this._geoVizModel = new App.Model.GeoViz(this._cartoVizModel.toJSON());

    if (this._user.get('autosave') && this._user.get('account')==this._geoVizModel.get('account'))
      this._geoVizModel.save();

    this.postrender();

  },

  postrender: function(){
    this.toolbar = new App.View.MapToolbar({
      el: this.$('.toolbar'),
      model: this._geoVizModel,
      map: this.map
    });
    this.toolbar.render();
  },

  render: function(){

    // this.setElement($('main'));
    this.$el.html(this._template());

    this.footer.setElement($('footer'));
    this.header.setElement($('header'));

    this.header.render();
    this.footer.render({classes: ''});

    this.$map = this.$('.map');
    this.$map.css('width','100%').css('height', (this.$el.parent().height() - 64) + "px"); // TODO: parameterize or calculate hardcoded toolbar height value (64px)

    var mapOptions = {
      zoom: 5,
      center: [43, 0]
    };
    this.map = new L.Map('map', mapOptions);

    this._cartoVizModel = new App.Model.CartoViz({
      id: this.model.get('viz'),
      account: this.model.get('account')
    });

    this._geoVizModel = new App.Model.GeoViz({
      id: this.model.get('viz'),
      account: this.model.get('account')
    });

    // Everything start after fetching models.
    this._nfetches = 0;

    this._cartoVizModel.fetch({
      success: this._onFetchVizModel
    });

    this._geoVizModel.fetch({
      success: this._onFetchVizModel
    });

    return this;
  }

});
