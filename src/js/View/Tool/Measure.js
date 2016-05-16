App.View.Tool.Measure = Backbone.View.extend({

  initialize: function(options) { 
  	this._map = options.map;

  	var _this = this;

  	this.drawnItems = new L.FeatureGroup();
		this._map.addLayer(this.drawnItems);

		var drawControl = new L.Control.Draw({
			draw: {
				polyline: {
					metric: true,
					shapeOptions: {
						color: '#3b7eba',
						weight:3
					},
				},
			},
			edit: {
				featureGroup: this.drawnItems
			}
		});

		this._map.on('draw:created', function (e) {
			_this.drawnItems.addLayer(e.layer);
		});

		new L.Draw.Polyline(this._map, drawControl.options.draw.polyline).enable()

  },

  events: {
  },

  render: function(){
    // this.$el.html(this._template());
    return this;
  }

});