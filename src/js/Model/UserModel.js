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
          this.set(JSON.parse(user))  
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

    var account = typeof attributes === 'object' ? attributes.account : attributes == 'account' ? options : null;
    
    if (account){
      var _this = this;
      this.checkAccount(account,function(st){
        _this.set('account_status',st);
        _this.trigger('change:account:status',st);
      });
    }

    Backbone.Model.prototype.set.apply(this, [attributes,options]); 
  }

  // unset: function(attribute,options){
  //   Backbone.Model.prototype.unset.apply(this, [attribute,options]);
  //   if (options && options.localStorage===true)
  //     this._saveToLocalStorage();
  // }

});