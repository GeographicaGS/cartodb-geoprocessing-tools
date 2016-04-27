'use strict';

var App = App || {};

App.Router = Backbone.Router.extend({

  routes: {
      '' : 'home',
      'map/:id': 'map',
      '(:account)/map_list' : 'map_list',
      '(:account)/map/(:viz)' : 'map',
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

  map: function(account,viz){
    var viz = '2b13c956-e7c1-11e2-806b-5404a6a683d5';
    var v = new App.View.Map({
      'model' : new Backbone.Model({'viz': viz})
    });

    App.showView(v,{'renderMode': 'after'});
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
