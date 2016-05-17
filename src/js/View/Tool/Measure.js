App.View.Tool.Measure = Backbone.View.extend({
	_template: _.template( $('#tool-measure_infowindow_template').html() ),

  initialize: function(options) { 

  	this._vis = options.vis;
  	this._map = options.map;
  	this._infoWindows = {};

  	var _this = this;

  	this.drawnItems = new L.FeatureGroup();
		this._map.addLayer(this.drawnItems);
		this._type = options.type;

		var drawControl = new L.Control.Draw({
			draw: {
				polyline: {
					metric: true,
					shapeOptions: {
						color: '#3b7eba',
						weight:3
					},
				},
				polygon: {
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
			_this._map.invalidateSize();
			var layer = e.layer,
      		type = e.layerType;

      
      _this._createInfoWindow(layer,type);

      // layer.on('click', function (e) {
      //     _this._layerClick(this,e,type);
      // });

		});

		this._map.on('draw:drawstop', function (e) {
			_this._drawTool.enable();
		});

		var cn = this._type == 'polyline' ? 'Polyline' : 'Polygon'

		this._drawTool = new L.Draw[cn](this._map, drawControl.options.draw[this._type]);
		this._drawTool.enable();
		

  },

  events: {
  },

  onClose: function(){
  	this._map.removeLayer(this.drawnItems);
  	this._map.off('draw:created');
  	this._map.off('draw:drawstop');
  	this._drawTool.disable();
  	_.each(this._infoWindows, function(info) {
  		info.remove();
  		delete info;
  	});

    this.stopListening();
  },

  _createInfoWindow:function(layer,type){
  	var _this = this;
    var infowindowModel = new cdb.geo.ui.InfowindowModel({
        template : _this._template(),
        latlng: [0, 0],
        offset: [0, 0]
    });
    var infowindow = new cdb.geo.ui.Infowindow({
        model: infowindowModel,
        mapView: _this._vis.mapView
    });
    this._vis.mapView.addInfowindow(infowindow);
    this._infoWindows[layer._leaflet_id] = infowindow;
    
    var aux,
    		value;
    if(type == "polygon"){
    	aux = L.GeometryUtil.readableArea(L.GeometryUtil.geodesicArea(layer._latlngs),true).split(' ');
      $(infowindow.el).find('h3').text('total area');
    }else{
        value = 0;
        var prevLatlng;
        for (var i=0; i<layer._latlngs.length; i++){
            if(i!=0){
                value += prevLatlng.distanceTo(layer._latlngs[i])
            }
            prevLatlng = layer._latlngs[i];
        }
        aux = L.GeometryUtil.readableDistance(value,true).split(' ');
        $(infowindow.el).find('h3').text('total distance')
    }
    value = App.nbf(aux[0])
    var measure = aux[1];
    $(infowindow.el).find(".value").html(value + ' <span>' + measure  + '</span>');

    var center = layer.getBounds().getCenter();
    this._infoWindows[layer._leaflet_id].setLatLng([center.lat,center.lng])
    this._infoWindows[layer._leaflet_id].showInfowindow();

    $(infowindow.el).find(".delete").click(function(e){
    	e.preventDefault();
			_this._infoWindows[layer._leaflet_id]._closeInfowindow();
			_this._infoWindows[layer._leaflet_id].remove();
			delete _this._infoWindows[layer._leaflet_id];
			_this.drawnItems.removeLayer(layer);
    });
  },

  // _layerClick: function(layer,e,type){
  //   this._infoWindows[layer._leaflet_id].setLatLng([e.latlng.lat,e.latlng.lng])
  //   this._infoWindows[layer._leaflet_id].showInfowindow();
  // },

  render: function(){
    return this;
  }

});