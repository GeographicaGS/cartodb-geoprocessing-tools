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

  _saveToLocalStorage: function(){
    if(typeof(Storage) !== "undefined") 
      localStorage.setItem('user',JSON.stringify(this.toJSON()));
    else
      console.error('Not supported localStorage');
  },

  setAccount: function(account){

    var _this = this;
    
    this.checkAccount(account,function(st){
      if (st){
        _this.set('account',account);
        
      }
      else{
        _this.unset('account');
      } 
      _this._saveToLocalStorage();
    });
  }

});