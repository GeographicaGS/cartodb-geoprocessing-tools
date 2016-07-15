'use strict';

App.Collection.BaseMap = Backbone.Collection.extend({

  initialize: function(options) {

  	this.add({
  		'id':'Stamen',
  		'maps':[
  			{
  				'thumb':'https://stamen-tiles-a.a.ssl.fastly.net/toner-background/6/30/24.png',
  				'url':'https://stamen-tiles-a.a.ssl.fastly.net/toner-background/{z}/{x}/{y}.png',
  				'url_label':'http://d.tile.stamen.com/toner-labels/{z}/{x}/{y}.png',
  				'title':'Toner'
  			},
  			{
  				'thumb':'https://stamen-tiles-a.a.ssl.fastly.net/toner/6/30/24.png',
  				'url':'https://stamen-tiles-a.a.ssl.fastly.net/toner/{z}/{x}/{y}.png',
  				'url_label':'',
  				'title':'Toner (labels below)'
  			},
  			{
  				'thumb':'https://stamen-tiles-a.a.ssl.fastly.net/toner-background/6/30/24.png',
  				'url':'https://stamen-tiles-a.a.ssl.fastly.net/toner-background/{z}/{x}/{y}.png',
  				'url_label':'',
  				'title':'Toner Background'
  			},
  			{
  				'thumb':'https://stamen-tiles-a.a.ssl.fastly.net/toner-lite/6/30/24.png',
  				'url':'https://stamen-tiles-a.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png',
  				'url_label':'',
  				'title':'Toner Lite'
  			},
  			{
  				'thumb':'https://stamen-tiles-a.a.ssl.fastly.net/toner-lines/6/30/24.png',
  				'url':'https://stamen-tiles-a.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}.png',
  				'url_label':'',
  				'title':'Toner Lines'
  			},
  			{
  				'thumb':'https://stamen-tiles-a.a.ssl.fastly.net/toner-hybrid/6/30/24.png',
  				'url':'https://stamen-tiles-a.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}.png',
  				'url_label':'',
  				'title':'Toner Hybrid'
  			},
  			{
  				'thumb':'https://stamen-tiles-a.a.ssl.fastly.net/watercolor/6/30/24.jpg',
  				'url':'https://stamen-tiles-a.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.jpg',
  				'url_label':'',
  				'title':'Watercolor'
  			}
  		]
  	});

  	this.add({
  		'id':'CartoDB',
  		'maps':[
  			{
  				'thumb':'http://a.basemaps.cartocdn.com/light_nolabels/6/30/24.png',
  				'url':'http://{s}d.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png',
  				'url_label':'http://b.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png',
  				'title':'Positron'
  			},
  			{
  				'thumb':'http://a.basemaps.cartocdn.com/dark_nolabels/6/30/24.png',
  				'url':'http://{s}d.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
  				'url_label':'http://a.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png',
  				'title':'Dark matter'
  			},
  			{
  				'thumb':'https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/6/30/24.png',
  				'url':'https://cartodb-basemaps-a.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png',
  				'url_label':'',
  				'title':'Positron (labels below)'
  			},
  			{
  				'thumb':'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/6/30/24.png',
  				'url':'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
  				'url_label':'',
  				'title':'Dark matter (labels below)'
  			},
  			{
  				'thumb':'https://cartodb-basemaps-a.global.ssl.fastly.net/light_nolabels/6/30/24.png',
  				'url':'https://cartodb-basemaps-a.global.ssl.fastly.net/light_nolabels/{z}/{x}/{y}.png',
  				'url_label':'',
  				'title':'Positron (lite)'
  			},
  			{
  				'thumb':'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_nolabels/6/30/24.png',
  				'url':'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_nolabels/{z}/{x}/{y}.png',
  				'url_label':'',
  				'title':'Dark matter (lite)'
  			},
  			{
  				'thumb':'https://cartocdn_a.global.ssl.fastly.net/base-eco/6/30/24.png',
  				'url':'https://cartocdn_a.global.ssl.fastly.net/base-eco/{z}/{x}/{y}.png',
  				'url_label':'',
  				'title':'CartoDB World Eco'
  			},
  			{
  				'thumb':'https://cartocdn_a.global.ssl.fastly.net/base-flatblue/6/30/24.png',
  				'url':'https://cartocdn_a.global.ssl.fastly.net/base-flatblue/{z}/{x}/{y}.png',
  				'url_label':'',
  				'title':'CartoDB World Flat Blue'
  			},
  			{
  				'thumb':'https://cartocdn_a.global.ssl.fastly.net/base-midnight/6/30/24.png',
  				'url':'https://cartocdn_a.global.ssl.fastly.net/base-midnight/{z}/{x}/{y}.png',
  				'url_label':'',
  				'title':'CartoDB World Midnight Commander'
  			},
  			{
  				'thumb':'https://cartocdn_a.global.ssl.fastly.net/base-antique/6/30/24.png',
  				'url':'https://cartocdn_a.global.ssl.fastly.net/base-antique/{z}/{x}/{y}.png',
  				'url_label':'',
  				'title':'CartoDB World Antique'
  			}
  		]
  	});

		this.add({
  		'id':'OneMap',
  		'maps':[
  			{
  				'thumb':'http://om2-test-tiles-b.smartgeo.sg/v2/Default/12/3229/2032.png	',
  				'url':'http://om2-test-tiles-b.smartgeo.sg/v2/Default/{z}/{x}/{y}.png	',
  				'url_label':'',
  				'title':'Singapore Map Design 1: Default'
  			},
  			{
  				'thumb':'http://om2-test-tiles-c.smartgeo.sg/v2/Night/12/3229/2032.png',
  				'url':'http://om2-test-tiles-c.smartgeo.sg/v2/Night/{z}/{x}/{y}.png',
  				'url_label':'',
  				'title':'Singapore Map Design 2: Night'
  			},
  			{
  				'thumb':'http://om2-test-tiles-b.smartgeo.sg/v2/Original/12/3229/2032.png',
  				'url':'http://om2-test-tiles-b.smartgeo.sg/v2/Original/{z}/{x}/{y}.png',
  				'url_label':'',
  				'title':'Singapore Map Design 3: Original	'
  			},
  			{
  				'thumb':'http://om2-test-tiles-c.smartgeo.sg/v2/Grey/12/3229/2032.png',
  				'url':'http://om2-test-tiles-c.smartgeo.sg/v2/Grey/{z}/{x}/{y}.png',
  				'url_label':'',
  				'title':'Singapore Map Design 4: Grey'
  			}
  		]
  	});

  },

  findMap:function(id,title){
    var el = this.get(id);
    if (!el)
      return _.findWhere(this.get('CartoDB').get('maps'),{'title':'Positron'}); 

  	var maps = this.get(id).get('maps');
  	return _.findWhere(maps,{'title':title});
  }

});
