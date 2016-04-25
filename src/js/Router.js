'use strict';

var app = app || {};

App.Router = Backbone.Router.extend({

  routes: {
      '' : 'home',
      'notfound' : 'notfound',
      'error' : 'error',
      '*other'    : 'defaultRoute'
  },
  
  home: function(){
    App.showView(new App.View.Home());
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