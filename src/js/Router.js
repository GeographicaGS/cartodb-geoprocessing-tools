'use strict';

var App = App || {};

App.Router = Backbone.Router.extend({

  routes: {
      '' : 'home',
      '(:account)/map_list' : 'map_list',
      'notfound' : 'notfound',
      'error' : 'error',
      '*other'    : 'defaultRoute'
  },

  home: function(){
    var m = new App.Model.UserLocalStorage(),
        account = m.get('account');

    if (account){
      // go to map list view
      this.navigate(account + '/map_list',{'trigger': true})
    }
    else{
      App.showView(new App.View.Account({
        'model':  m
      }));  
    }
    
  },

  map_list: function(account){
    App.showView(new App.View.MapList({
      'model' : new App.Model.User({'account' : account})
    }));
  },

  defaultRoute: function(){
    App.showView(new App.View.Error404());
  },

  notfound: function(){
    App.showView(new App.View.Error404());
  },

  error: function(){
    App.showView(new App.View.Error500());
  }
});