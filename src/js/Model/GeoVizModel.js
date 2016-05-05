App.Model.GeoViz = Backbone.Model.extend({
  
  constructor: function() {
    this._user = new App.Model.UserLocalStorage(); 
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
                if (data && data.rows.length && data.rows[0].viz) 
                  options.success(data.rows[0].viz);
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

      var viz_json = JSON.stringify(_this.toJSON());
      console.log('Update save');
      if (this.get('account') != this._user.get('account')){
        throw 'Cannot call to save on other user\'s account';
      }
      else if (!this._user.get('autosave') || !this._user.get('api_key')){
        throw 'Autosave not enable! Bad hack attempt';
      }
      else{
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

  setSublayerVisibility: function(sublayerid,visible){
    console.log(this.toJSON());
  }

});