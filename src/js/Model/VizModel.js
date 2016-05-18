App.Model.Viz = Backbone.Model.extend({

  getSublayers: function(){
    return _.find(this.get('layers'), function(l){ return l.type=='layergroup'}).options.layer_definition.layers;
  },

  findSublayer: function(sublayerid,field){
    return _.findWhere(this.getSublayers(),{gid: sublayerid});
  },

  findSublayerIdx: function(sublayerid){
    return this.getSublayers().indexOf(this.findSublayer(sublayerid));
  },

  getSublayersIds: function(){
    return _.pluck(this.getSublayers(),'gid');
  },

  getInvisibleLayers: function(){
    return _.where(this.getSublayers(),{visible: false});
  },

  setSublayers: function(sublayers){
    _.find(this.get('layers'), function(l){ return l.type=='layergroup'}).options.layer_definition.layers = sublayers;
  }

});

