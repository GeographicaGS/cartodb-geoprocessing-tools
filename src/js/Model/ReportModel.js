App.Model.Report = Backbone.Model.extend({
  
  // url: function(){
  //   return App.Config.viz_api_url(this.get('account'),this.get('id'));
  // },
  
  sync: function(method, model, options){

  	sql = new cartodb.SQL({ user: this.get('account') });
  	var q = 'WITH a as (' + this.get('layer_sql') + ') SELECT ';
  	_.each(this.get('fields'),function(field) {
  		var name = field.name;
  		_.each(field.operations, function(p) {
  			q += p + '(' + name + ') as ' + name + '_' + p  + ',';
  		});
  	});

  	q = q.slice(0,-1);
  	q += ' FROM a';

    if(this.get('geom'))
      q += ' WHERE the_geom && ST_MakeEnvelope(' + this.get('geom')._southWest.lng + ', ' + this.get('geom')._southWest.lat + ',' + this.get('geom')._northEast.lng + ',' + this.get('geom')._northEast.lat + ',4326)'
    

  	sql.execute(q,{cache:false}).done(function(data) {
  		if (data && data.rows.length && data.rows[0]) {
        options.success(data.rows[0]);
      }
      else{
        options.success({});
      }
  	})
    .error(function(errors) {
      options.error(errors);
    });
  },

});

