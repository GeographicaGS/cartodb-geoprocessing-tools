App.Model.GeoViz = App.Model.Viz.extend({
  
  constructor: function() {
    this._user = App.getUserModel(); 
    Backbone.Model.apply(this, arguments);
  },

  url: function(){
    return App.Config.viz_api_url(this.get('account'),this.get('id'));
  },
  
  sync: function(method, model, options){
    var q,sql,
        tablename = App.Config.Data.CFG_TABLE_NAME,
        _this = this;

    if (method == 'read'){
      sql = new cartodb.SQL({ user: this.get('account') });

      // check if table exists
      q = "select count(*) as n from CDB_UserTables() as name where name='{{tablename}}'";

      sql.execute(q,{tablename: tablename},{cache:false})
        .done(function(data) {
          if (data && data.rows.length && data.rows[0].n){
            q = "SELECT viz FROM {{tablename}} WHERE id_viz='{{id_viz}}'"
            sql.execute(q,{tablename: tablename, id_viz: _this.get('id')},{cache:false})
              .done(function(data) {
                if (data && data.rows.length && data.rows[0].viz) {
                  options.success(data.rows[0].viz);
                }
                else{
                  options.success({});
                }
              })
              .error(function(errors) {
                options.error(errors);
                
              });
          }
          else{
            options.success({});  
          }
          
        })
        .error(function(errors) {
          options.error(errors);
        });
    }
    else if ( method == 'update'){

      if (this.get('account') != this._user.get('account')){
        // throw 'Cannot call to save on other user\'s account';
        return;
      }

      else if (this._user.get('autosave')!='enabled' || !this._user.get('api_key')){
        //throw 'Autosave not enable! Bad hack attempt';
        return;
      }
      else{

        var viz_json = JSON.stringify(_this.toJSON()).replace(/'/g, "''");

        sql = new cartodb.SQL({ user: this.get('account') });
        var api_key = this._user.get('api_key');

        // all allow, let's do the request
        q = "SELECT count(*) as n FROM {{tablename}} where id_viz='{{id_viz}}'";

        // Note cache: false
        sql.execute(q,{tablename: tablename,id_viz: this.get('id')},{cache:false})
        .done(function(data) {
          // TODO: Use upsert when CartoDB updates to PostgreSQL 9.5
          if (data && data.rows.length && data.rows[0].n){
            // UPDATE
            q = "UPDATE {{tablename}} set viz='{{{viz_json}}}' WHERE id_viz='{{id_viz}}'";
          }
          else{
            // INSERT INTO
            q = "INSERT INTO {{tablename}} (id_viz,viz) VALUES ('{{id_viz}}','{{{viz_json}}}')";
          }

          sql.execute(q,{tablename: tablename, id_viz: _this.get('id'), viz_json: viz_json},
              {api_key: api_key})
              .done(function(data) {
                options.success(true);
              })
              .error(function(errors) {
                options.error(errors);
              });
          
        })
        .error(function(errors) {
          options.error(errors);
        });
      }
    }
    else
    {
      throw 'Unsupported method at GeoViz Model';
    }
  },

  _saveAndTrigger: function(){
    this.save();
    this.set('updated_at',new Date().getTime());
//    this.trigger('change');
  },

  setSublayerVisibility: function(sublayerid,visible){
    var l = this.findSublayer(sublayerid);
    l.visible = visible;
    this._saveAndTrigger();
  },

  removeSublayer: function(sublayerid){

    var layer = this.findSublayer(sublayerid);

    if (layer.geolayer){
      // Layers added from the geoprocessing tools are completely removed. 
      var layers = this.getSublayers();
      var index = this.findSublayerIdx(sublayerid);

      if (index > -1) {
        layers.splice(index, 1);
      }
    }
    // else{
    //   // Layers added from CartoDB editor are not completely removed.  
    //   var layer = this.findSublayer(sublayerid);
    //   layer.remove = true;
    //   layer.visible = false;
    // }

    this._saveAndTrigger();
  },

  updateSubLayerCartoCSS:function(sublayerid,cartocss){
    var l = this.findSublayer(sublayerid);
    l.options.cartocss = cartocss;

    this._saveAndTrigger();
    this.trigger('sublayer:change:cartocss',l);
  },

  getSublayersByGeometryType: function(geomtypeshort){

    var l = _.filter(this.getSublayers(), function(l){
      
      if (typeof geomtypeshort == 'string')
        geomtypeshort = [geomtypeshort];
      
      for (var i in geomtypeshort){
        if (l.geometrytype && l.geometrytype.toLowerCase().indexOf(geomtypeshort[i])!=-1)
          return true;
      }
      return false;
    });
    return l;
  },



  // getSublayersByGeometryType: function(geometrytypes,cb){

  //   var sublayers = this.getSublayers();

  //   var queries = _.map(sublayers,function(sub){
  //     var t = "SELECT '{{id}}' as id, st_geometrytype(the_geom_webmercator) as geometrytype FROM ({{{q}}}) s LIMIT 1";
  //     return Mustache.render(t,{id: sub.id, q: sub.options.sql});
  //   });

  //   var q = '(' + queries.join(') UNION (') + ')';
  //   var sql = new cartodb.SQL({ user: this.get('account') });

  //   sql.execute(q)
  //     .done(function(data) {
  //       var a = _.filter(sublayers,function(n){
  //         var l = _.findWhere(data.rows,{id: n.id});
  //         if (typeof geometrytypes == 'string')
  //           geometrytypes = [geometrytypes];
  //         var flag = true;
  //         for (var i in geometrytypes){
  //           if (l.geometrytype.toLowerCase().indexOf(geometrytypes[i])!=-1)
  //             return true;
  //         }
  //         return false;
  //       });
  //       cb(a,null);
  //     })
  //     .error(function(errors) {
  //       cb(null,errors)
  //     });
  // },


  // getSublayerGeometryType : function(id,cb){
  //   var l = this.findSublayer(id);
  //   if (!l)
  //     return cb(null);

  //   var q = "WITH q as ({{{sql}}}),"
  //       // Take 200 records for the heuristics. TODO: Improve it.
  //       + " geomtype as (select st_geometrytype(the_geom_webmercator) as geometrytype from q LIMIT 200),"
  //       // Group by geometrytype
  //       + " r as (select geometrytype,count(*) as n from geomtype group by geometrytype)"
  //       // Take the biggest group
  //       + " select geometrytype from r order by n DESC LIMIT 1";

  //   var sql = new cartodb.SQL({ user: this.get('account') });

  //   sql.execute(q,{sql: l.options.sql})
  //     .done(function(data) {
  //       if (data && data.rows && data.rows.length)
  //         cb(data.rows[0].geometrytype,l);
  //       else 
  //         cb(null,l);
  //     })
  //     .error(function(errors) {
  //       cb(null,l,errors)
  //     });

  // },


  getSublayerGeometryType : function(id,cb){
    var l = this.findSublayer(id);
    if (!l)
      return cb(null);

    var q = "WITH q as ({{{sql}}})"
        + "select st_geometrytype(the_geom_webmercator) as geometrytype from q group by geometrytype";

    var sql = new cartodb.SQL({ user: this.get('account') });

    sql.execute(q,{sql: l.options.sql})
      .done(function(data) {
        if (data && data.rows && data.rows.length==1){
          cb(data.rows[0].geometrytype,l);
        }
        else if (data && data.rows && data.rows.length>1){
          cb('multi',l);
        }
        else{
          cb(null,l);
        }
      })
      .error(function(errors) {
        cb(null,l,errors)
      });

  },


  // guessSublayerGeometryType: function(id,cb){
    
  //   var _this = this;

  //   this.getSublayerGeometryType(id,function(geometrytype,l,err){
  //     if (err)
  //       console.log('Cannot guess sublayer '+ l.gid + ' geometry type');
  //     else{
  //       l.geometrytype = geometrytype;
  //       _this.trigger('sublayer:set:geometrytype',l);
  //     }

  //     if (cb)
  //       cb(geometrytype,l,err);
  //   });

  // },

  // _guessSublayersGeometryTypesSerial: function(ids,i,cb){
  //   var _this = this;
  //   this.guessSublayerGeometryType(ids[i],function(geometrytype,l,err){
  //     i++;
  //     if (i<ids.length)
  //       _this._guessSublayersGeometryTypesSerial(ids,i,cb);
  //     else if (cb)
  //         cb();

  //   });
  // },

  // guessSublayersGeometryTypesSerial: function(){

  //   var _this = this,
  //     ids = this.getSublayersIds();

  //   this._guessSublayersGeometryTypesSerial(ids,0,function(){
  //     _this.save();
  //   });
    
  // },

  calculateSublayersGeometryTypes: function(cb){

    var ids = this.getSublayersIds(),
      counter = 0;

    for (var i in ids){
      this.getSublayerGeometryType(ids[i],function(geometrytype,l,err){
        counter++;
        l.geometrytype = geometrytype;
        if (counter==ids.length)
          cb();
      });
    }
    
  },

  getSublayersFields: function(sublayerid,cb){
    var sub = this.findSublayer(sublayerid);
    if (!sub){
      return cb(null,new Error('Sublayer with id \'' + sublayerid + '\' not found'));
    }

    var sql = new cartodb.SQL({ user: this.get('account') });
    var q = ' SELECT * FROM ({{{q}}}) as s LIMIT 1';

    sql.execute(q,{q: sub.options.sql})
      .done(function(data) {
        if (data.rows.length)
          cb(_.allKeys(data.rows[0]),null);
        else
          cb([],null);
      })
      .error(function(errors) {
        cb(null,errors)
      });

  },

  getSublayersFields2: function(sublayerid,cb){
    var sub = this.findSublayer(sublayerid);
    if (!sub){
      return cb(null,new Error('Sublayer with id \'' + sublayerid + '\' not found'));
    }

    var sql = new cartodb.SQL({ user: this.get('account') });
    var q = ' SELECT * FROM ({{{q}}}) as s LIMIT 1';

    sql.execute(q,{q: sub.options.sql})
      .done(function(data) {
        cb(data.fields)
      })
      .error(function(errors) {
        cb(null,errors)
      });
  },

  // Fields must be the output of getSublayersFields2
  filterFieldsByType: function(fields,type){
    var r = _.pick(fields, function(value, key, object) {
      return value.type == type;
    });
    return _.allKeys(r);
  },

  getSublayersFieldsByType: function(sublayerid,type,cb){
    var sub = this.findSublayer(sublayerid);
    if (!sub){
      return cb(null,new Error('Sublayer with id \'' + sublayerid + '\' not found'));
    }

    var sql = new cartodb.SQL({ user: this.get('account') });
    var q = ' SELECT * FROM ({{{q}}}) as s LIMIT 1';
    var _this = this;
    sql.execute(q,{q: sub.options.sql})
      .done(function(data) {
        var r = _this.filterFieldsByType(data.fields,type);
        cb(r);
      })
      .error(function(errors) {
        cb(null,errors)
      });
  },

  _guid: function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
      s4() + '-' + s4() + s4() + s4();
  },

  getUUID: function(){
    do{
      var uuid = this._guid();
    }
    while (this.findSublayer(uuid))
    return uuid;
  },

  addSublayer:function(layerdef){
    var layers = this.getSublayers();
    layers.push(layerdef);
    delete layerdef.id;
    layerdef.order = layers.length;
    layerdef.geolayer = true;
    layerdef.gid = this.getUUID();
    this.trigger('addSublayer',layerdef);
    this.save();
    //this._saveAndTrigger();
    //this.guessSublayerGeometryType(layerdef.gid);
  },

  // save: function(attributes,options){
  //   if (!attributes)
  //     attributes = {};
    
  //   attributes['updated_at_ts'] = new Date().getTime();
  //   Backbone.Model.prototype.save.apply(this, [attributes,options]);
  // } 

});