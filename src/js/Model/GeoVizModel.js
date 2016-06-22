'use strict';

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
      var username = this.get('account');
      sql = App.Utils.getCartoDBSQLInstance(username);

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
              .error(function(errors, xhr) {
                App.onAjaxError(xhr.status);
                options.error(errors);
              });
          }
          else{
            options.success({});
          }

        })
        .error(function(errors, xhr) {
          App.onAjaxError(xhr.status);
          options.error(errors);
        });
      // check if table exists

      // q = "SELECT viz FROM {{tablename}} WHERE id_viz='{{id_viz}}'"
      // sql.execute(q,{tablename: tablename, id_viz: _this.get('id')},{cache:false})
      //   .done(function(data) {
      //     if (data && data.rows.length && data.rows[0].viz) {
      //       options.success(data.rows[0].viz);
      //     }
      //     else{
      //       options.success({});
      //     }
      //   })
      //   .error(function(errors) {
      //     options.error(errors);
      //   });

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
        var username = this.get('account');
        sql = App.Utils.getCartoDBSQLInstance(username);
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
              .error(function(errors, xhr) {
                App.onAjaxError(xhr.status);
                options.error(errors);
              });

        })
        .error(function(errors, xhr) {
          App.onAjaxError(xhr.status);
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

    this._layerManager.removeLayer(layer);
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

  getSublayersByGeometryType: function(geomtypeshort,opts){
    var opts = _.defaults(opts || {}, {geolayer_ready: true});
    var l = _.filter(this.getSublayers(), function(l){

      if (typeof geomtypeshort == 'string')
        geomtypeshort = [geomtypeshort];

      for (var i in geomtypeshort){
        if (l.geometrytype && l.geometrytype.toLowerCase().indexOf(geomtypeshort[i])!=-1){
          if (l.geolayer && opts.geolayer_ready){
            return l.geolayer.status == App.Cons.LAYER_READY;
          }
          else {
            return true;
          }
        }

      }
      return false;
    });
    return l;
  },

  getSublayerGeometryType : function(id,cb){
    var l = this.findSublayer(id);
    if (!l)
      return cb(null);

    var q = "WITH q as ({{{sql}}})"
        + "select st_geometrytype(the_geom_webmercator) as geometrytype from q "
        + "where the_geom_webmercator is not null AND not ST_IsEmpty(the_geom_webmercator)"
        + "group by geometrytype";

    var username = this.get('account');
    var sql = App.Utils.getCartoDBSQLInstance(username);

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
      .error(function(errors, xhr) {
        App.onAjaxError(xhr.status);
        cb(null,l,errors)
      });

  },

  calculateSublayersGeometryTypes: function(cb){

    var ids = this.getSublayersIds(),
      counter = 0;

    for (var i in ids){
      this.getSublayerGeometryType(ids[i],function(geometrytype,l,err){
        counter++;
        l.geometrytype = geometrytype;

        if(err){
          l.geolayer.status = App.Cons.LAYER_ERROR;
          l.geolayer.error = {
            what_about: err[0]
          };
        }

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
    var username = this.get('account');
    var sql = App.Utils.getCartoDBSQLInstance(username);
    var q = ' SELECT * FROM ({{{q}}}) as s LIMIT 1';

    sql.execute(q,{q: sub.options.sql})
      .done(function(data) {
        if (data.rows.length)
          cb(_.allKeys(data.rows[0]),null);
        else
          cb([],null);
      })
      .error(function(errors, xhr) {
        App.onAjaxError(xhr.status);
        cb(null,errors)
      });

  },

  getSublayersFields2: function(sublayerid,cb){
    var sub = this.findSublayer(sublayerid);
    if (!sub){
      return cb(null,new Error('Sublayer with id \'' + sublayerid + '\' not found'));
    }

    var username = this.get('account');
    var sql = App.Utils.getCartoDBSQLInstance(username);
    var q = ' SELECT * FROM ({{{q}}}) as s LIMIT 1';

    sql.execute(q,{q: sub.options.sql})
      .done(function(data) {
        cb(data.fields)
      })
      .error(function(errors, xhr) {
        App.onAjaxError(xhr.status);
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

    var username = this.get('account');
    var sql = App.Utils.getCartoDBSQLInstance(username);
    var q = ' SELECT * FROM ({{{q}}}) as s LIMIT 1';
    var _this = this;
    sql.execute(q,{q: sub.options.sql})
      .done(function(data) {
        var r = _this.filterFieldsByType(data.fields,type);
        cb(r);
      })
      .error(function(errors, xhr) {
        App.onAjaxError(xhr.status);
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

    delete layerdef.id;
    layerdef.order = layers.length+1;
    layerdef.gid = this.getUUID();
    layerdef.geolayer = {
      status: App.Cons.LAYER_WAITING,
      time : new Date(),
      proc_sql : layerdef.options.sql
    };
    this._layerManager.createLayer(layerdef);
    layers.push(layerdef);

    this.trigger('addSublayer',layerdef);
    this.save();

    //this._saveAndTrigger();
  },

  onLayerCreated: function(layerdef){
    this.trigger('sublayer:created',layerdef);
    this.save();
  },

  onLayerReady: function(layerdef){
    this.trigger('sublayer:ready',layerdef);
    this.save();
  },

  onLayerFailed: function(layerdef){
    this.trigger('sublayer:failed',layerdef);
    this.save();
  },

  getReadyLayers: function(){
    return _.filter(this.getSublayers(),function(l){
      return !l.geolayer || l.geolayer.status == App.Cons.LAYER_READY;
    });
  },

  createLayerManager: function(){
    this._layerManager = new App.LayerManager({
      userModel: this._user,
      geoVizModel: this
    });

    this.listenTo(this._layerManager,'layerCreated',this.onLayerCreated);
    this.listenTo(this._layerManager,'layerReady',this.onLayerReady);
    this.listenTo(this._layerManager,'layerFailed',this.onLayerFailed);

    this._layerManager.run();
    return this._layerManager;

  },

  getLayersForDraw: function(){
    return _.filter(this.getSublayers(),function(m){
      return (m.visible && (!m.geolayer || m.geolayer.status == App.Cons.LAYER_READY));
    });
  },

  setSublayers: function(sublayers, options){
    var options = options || {};
    App.Model.Viz.prototype.setSublayers.apply(this,[sublayers]);
    if(!options.silent){
      this._saveAndTrigger();
    }
  },

  getSublayers: function(options){
    var options = _.defaults(options || {},{only_ready: false});
    var sublayers = App.Model.Viz.prototype.getSublayers.apply(this,[options]);
    if (!options.only_ready){
      return sublayers;
    }
    else{
      return _.filter(sublayers,function(l){
        return !l.geolayer || l.geolayer.status == App.Cons.LAYER_READY;
      });
    }
  }

});
