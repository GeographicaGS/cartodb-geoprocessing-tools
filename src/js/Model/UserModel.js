App.Model.User = Backbone.Model.extend({
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
    
    
  }
});