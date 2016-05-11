App.Utils = {
  getPostgisMultiType: function(type){
    // TODO: Complete it with all PostGIS types.
    if (type=='ST_Polygon')
      return 'ST_MultiPolygon';
    else if (type=='ST_LineString')
      return 'ST_MultiLineString';
    else if (type=='ST_Point')
      return 'ST_MultiPoint';
    return type;

  },

  getConstantGeometryType: function(type){
    var t = type.toLowerCase();
    if (t.indexOf('point')!=-1){
      return 1;
    }
    else if (t.indexOf('line')!= -1){
      return 2;
    }
    else if (t.indexOf('polygon')!= -1){
      return 3;
    }
    else{
      throw new Error('Not found constant for geometry type '+ type);
    }
  }
}