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

  }
}