App.Model.Wizard.CartoCSS = Backbone.Model.extend({
  // toCartoCSS: function(){

  //   var m = this.toJSON();
  //   for (var i in m){
  //     if (!m[i])
  //       delete m[i];
  //   }

  //   var res = JSON.stringify(m);
  //   return '#overlay' +  res.replace(/_/g, '-').replace(/,/g,';\n');
  // }

  toCartoCSS: function(){

    var m = this.toJSON();
    var resp = [];
    for (var i in m){
      if (!m[i])
        // ignoring nulls
        continue;

      resp.push(i.replace(/_/g, '-') + ':' + m[i] + ';');
    }

    return '#overlay{\n' +  resp.join('\n') + '\n}';
  },

  loadCartoCSS: function(cartoCSSString){
    var re = /([\w-]+):\s?([#A-Za-z0-9-.]*)/g;
    while((result = re.exec(cartoCSSString)) !== null) {
      var property = result[1].replace(/-/g, '_');
      if(this.get(property)){
        this.set(property, result[2]);
      }
    }
  }
});

App.Model.Wizard.CartoCSSPolygon =App.Model.Wizard.CartoCSS.extend({
  defaults: {
    'polygon_fill': '#FF6600',
    'polygon_opacity': 0.7,
    'line_width' : 0.5,
    'line_color' : '#FFFFFF',
    'line_opacity' : 1,
    'polygon_comp_op' : null
  }
});

App.Model.Wizard.CartoCSSLine = App.Model.Wizard.CartoCSS.extend({
  defaults: {
    'line_color': '#FF6600',
    'line_width': 2,
    'line_opacity': 0.7,
    'line_comp_op': null
  }
});

App.Model.Wizard.CartoCSSPoint = App.Model.Wizard.CartoCSS.extend({
  defaults: {
    'marker_fill_opacity': 0.9,
    'marker_line_color': '#FFFFFF',
    'marker_line_width': 1,
    'marker_line_opacity': 1,
    'marker_placement': 'point',
    'marker_type': 'ellipse',
    'marker_width': 10,
    'marker_fill': '#FF6600',
    'marker_allow_overlap': true,
    'marker_comp_op' : null
  }
});


App.Model.Wizard.getModelInstance = function(geometrytype){

  if (geometrytype=='ST_MultiPolygon' || geometrytype=='ST_Polygon'){
    return new App.Model.Wizard.CartoCSSPolygon();
  }
  else if (geometrytype=='ST_Point' || geometrytype=='ST_MultiPoint'){
    return new App.Model.Wizard.CartoCSSPoint();
  }
  else{
    return new App.Model.Wizard.CartoCSSLine();
  }

}
