'use strict';

var app = app || {};

App.Router = Backbone.Router.extend({

  routes: {
      '' : 'home',
      'map/:id': 'map',
      'notfound' : 'notfound',
      'error' : 'error',
      '*other'    : 'defaultRoute'
  },

  home: function(){
    App.showView(new App.View.Home());
  },

  map: function(id){
    App.showView(new App.View.Map({'id': id}));
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
