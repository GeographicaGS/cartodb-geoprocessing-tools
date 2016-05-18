
LayerManager = function(opts){
  _.extend(this, Backbone.Events);
  this.userModel = opts.userModel;
  this.geoVizModel = opts.geoVizModel;
  this._url = App.Config.import_api_url(this.userModel.get('account'));
  this._works = [];
  this._intervals = {};
  return this;
};

LayerManager.prototype.createLayer = function(layerdef){
  
  var q = [
    "create table {{tablename}} as ({{{layer_query}}});"
  ];

  var _this = this;

  $.ajax({
    url: this._url,
    data: {
      sql: layerdef.options.sql,
      table_name: layerdef.options.layer_name,
      privacy: 'public',
      api_key: this.userModel.get('api_key')
    },
    method: 'POST'
  })
  .done(function( data, textStatus, jqXHR ) {
    if (data.success){
      layerdef.geolayer.status = App.Cons.LAYER_RUNNING;
      layerdef.geolayer.item_queue_id = data.item_queue_id;
      _this._addWork(layerdef);
    }
    else{
      layerdef.geolayer.status = App.Cons.LAYER_ERROR;
    }
    
  })
  .fail(function( jqXHR, textStatus, errorThrown){
    layerdef.geolayer.status = App.Cons.LAYER_ERROR;
  })
  .always(function(){
    _this.trigger('layerCreated',layerdef);
  });
  
};

LayerManager.prototype._addWork = function(w){
  this._works.push(w);
  this._workInspector(w);
};

LayerManager.prototype.removeLayer = function(layer){
  //TODO: Use Job API
  sql = new cartodb.SQL({ user: this.userModel.get('account') });
  var api_key = this.userModel.get('api_key');

  // all allow, let's do the request
  q = "DROP TABLE {{layername}}"; 

  // Note cache: false
  sql.execute(q,{layername: layer.geolayer.table_name},{api_key: api_key})
    .error(function(errors) {
      console.error('Cannot remove layer');
      console.error(errors);
    });

};

LayerManager.prototype.cancelLayer = function(layer){
  //TODO. IMPORT API doesn't support it.
};

LayerManager.prototype._initializeWorksFromViz = function(){
  
  this._works = _.filter(this.geoVizModel.getSublayers(),function(l){
    return l.geolayer && 
       [App.Cons.LAYER_RUNNING,App.Cons.LAYER_WAITING].indexOf(l.geolayer.status)!=-1;
  });
};

LayerManager.prototype._cleanWork = function(work){
  this._works = _.without(this.works,work);
  clearInterval(this._intervals[work.gid]);
  delete this._intervals[work.gid];
};

LayerManager.prototype._processWorkResponse = function(work,res) {
  if (res.state=='complete'){
    work.options.sql = 'select * from ' + res.table_name;
    work.geolayer.status = App.Cons.LAYER_READY;
    work.geolayer.table_name =  res.table_name; 
    // REMOVE  work
    
    this.trigger('layerReady',work);
    this._cleanWork(work);
    
  }
  else if (res.state == 'failure'){
    work.geolayer.status = App.Cons.LAYER_ERROR;

    var error = res.get_error_text;
    error.sql = work.options.sql;
    work.geolayer.error = error;
    this.trigger('layerFailed',work);
    this._cleanWork(work);
  }
  else{
    console.log(res.state + ' ' + work.options.layer_name);
  }



  if (res.warnings){
    console.log('Here the warning: ' + res.warning);
  }
};

LayerManager.prototype._workInspector = function(w){
  if (this._intervals[w.gid])
    clearInterval(this._intervals[w.gid]);

  var _this = this

  this._intervals[w.gid] = setInterval(function(){
    $.ajax({
      url: _this._url + '/' +  w.geolayer.item_queue_id,
      data: {
        api_key: _this.userModel.get('api_key')
      }
    }) 
    .done(function( res, textStatus, jqXHR ) {
      _this._processWorkResponse(w,res);
    })
    .fail(function( jqXHR, textStatus, errorThrown){
      console.error('Cannot get info from Batch API');
    })
  },6000);

  return this;
}

LayerManager.prototype.run = function(){
  
  this._initializeWorksFromViz();
  for (var i in this._works){
    this._workInspector(this._works[i]);
  }
  return this;
  
}

