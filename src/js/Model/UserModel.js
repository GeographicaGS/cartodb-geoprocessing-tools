App.Model.User = Backbone.Model.extend({
  
  checkAccount: function(account,cb){
    var sql = new cartodb.SQL({ 'user': account});
    sql.execute("SELECT now()")
      .done(function(data) {
       cb(true);
      })
      .error(function(errors) {
        cb(false);
      });
  }
});

App.Model.UserLocalStorage = App.Model.User.extend({
  
  constructor: function() {
    Backbone.Model.apply(this, arguments);
    if(typeof(Storage) !== "undefined") {
      // Load Model from localStorage
      this._loadFromLocalStorage();
    }
  },

  _loadFromLocalStorage: function(){
    if(typeof(Storage) !== "undefined"){
      var user = localStorage.getItem('user');
      if (user){
        try{
          Backbone.Model.prototype.set.apply(this, [JSON.parse(user)]); 
        }
        catch(err){
          console.error('Cannot parse user localStorage info: '+ err.message);
        }
      }
    }
    else
      console.error('Not supported localStorage');
  },

  save: function(){
    if(typeof(Storage) !== "undefined") 
      localStorage.setItem('user',JSON.stringify(this.toJSON()));
    else
      console.error('Not supported localStorage');
  },

  set: function(attributes,options){
    var _this = this;
    var account = typeof attributes === 'object' ? attributes.account : attributes == 'account' ? options : null;
    
    if (account){
      var _this = this;
      this.checkAccount(account,function(st){
        _this.set('account_status',st);
        _this.trigger('change:account:status',st);
      });
    }

    var autosave = typeof attributes === 'object' ? attributes.autosave : attributes == 'autosave' ? options : null;
    if (autosave){
      this._setAutosave(autosave);
      if (attributes === 'object')
        delete attributes.autosave;
      else
        // Only autosave return.
        return;
    }
    
    Backbone.Model.prototype.set.apply(this, [attributes,options]); 


    // if (autosave){

    //   if (!this.get('account') && !attributes.account){
    //     throw 'Cannot set autosave without a valid account';
    //   }  

    //   var api_key = this.get('api_key') || attributes.api_key;
    //   if (!api_key){
    //     throw 'Cannot set autosave without a valid api_key';
    //   }  
    //   // Check if user has the config table at his account.
    //   // Create SQL object
    //   var sql = new cartodb.SQL({ user: this.get('account') });
    //   // check if table exists
    //   var q = "select count(*) as n from CDB_UserTables() as name where name='{{tablename}}'";
    //   sql.execute(q,{tablename: App.Config.Data.CFG_TABLE_NAME},{cache: true})
    //     .done(function(data) {
    //       if (data && data.rows.length && data.rows[0].n){
    //         // Table already exits 
    //         Backbone.Model.prototype.set.apply(_this, [attributes,options]);
    //       }
    //       else{
    //         // Let's create the table
    //         q = 'CREATE TABLE {{tablename}} (id_viz text, viz json, PRIMARY KEY(id_viz)); GRANT SELECT ON {{tablename}} TO publicuser;';
    //         sql.execute(q,{tablename: App.Config.Data.CFG_TABLE_NAME},{api_key: api_key,cache: true})
    //           .done(function(data) {
    //             Backbone.Model.prototype.set.apply(_this, [attributes,options]);
    //           })
    //           .error(function(errors) {
    //             console.error('Cannot create config table at CartoDB. ' + errors);
    //           });
    //       }
    //     })
    //     .error(function(errors) {
    //       console.error('Cannot check if config table exists. ' + errors);
    //     });
    // }
    // else{
    //   Backbone.Model.prototype.set.apply(this, [attributes,options]); 
    // }
    

    return this;
   
  },

  _createConfigTable: function(){
    var sql = new cartodb.SQL({ user: this.get('account') });
    // check if table exists
    var q = "select count(*) as n from CDB_UserTables() as name where name='{{tablename}}'";
    sql.execute(q,{tablename: App.Config.Data.CFG_TABLE_NAME},{cache: true})
      .done(function(data) {
        if (data && data.rows.length && data.rows[0].n)
          // Table already exits 
          return;
        
        // Let's create the table
        var q = 'CREATE TABLE {{tablename}} (id_viz text, viz json, PRIMARY KEY(id_viz)); GRANT SELECT ON {{tablename}} TO publicuser;';
        sql.execute(q,{tablename: App.Config.Data.CFG_TABLE_NAME},{api_key: api_key,cache: true})
          .done(function(data) {
            
          })
          .error(function(errors) {
            console.error('Cannot create config table at CartoDB. ' + errors);
          });
        
      })
      .error(function(errors) {
        console.error('Cannot check if config table exists. ' + errors);
      });
  },

  _validateAPIKey: function(cb){
    if (!this.get('api_key'))
      return false;

    // Create SQL object
    var sql = new cartodb.SQL({ user: this.get('account') });
    // check if table exists
    var q = "BEGIN;CREATE VIEW {{name}} as select 1; drop view {{name}}; COMMIT;";
    sql.execute(q,{name: 'cdb_geoproctool_apikeytest'},{cache: true,api_key:this.get('api_key') + '111'})
      .done(function(data) {
        cb(true);
      })
      .error(function(errors) {
        console.error(errors);
      });
  },

  _setAutosave: function(status){
    if (['disabled','waiting'].indexOf(status)!=-1){
      this.set('autosave',status);
    }
    else if (status == 'enabled'){
      // Check if it's a valid a api_key
      var _this = this;
      this._validateAPIKey(function(valid){
        if (valid){
          _this._createConfigTable();
          _this.set('autosave',status);
        }
        else
          _this.set('autosave','waiting');
      });
    }
  }

});