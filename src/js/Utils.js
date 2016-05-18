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
  },

  getBaseGeometryType: function(sttype){
   if (sttype=='ST_MultiPolygon' || sttype=='ST_Polygon'){
     return 'polygon';
    }
    else if (sttype=='ST_MultiLineString' || sttype=='ST_LineString'){
      return 'line';
    }
    else if (sttype=='ST_MultiPoint' || sttype=='ST_Point'){
      return 'point';
    }  
  },

  slugify:function(text){
    return text.toString().toLowerCase()
      .replace(/\s+/g, '_')           // Replace spaces with _
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '_')         // Replace multiple - with single _
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }
}