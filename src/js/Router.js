'use strict';

var App = App || {};

App.Router = Backbone.Router.extend({

  routes: {
      '' : 'home',
      'login': 'home',
      '(:account)/map_list' : 'map_list',
      '(:account)/map/(:viz)' : 'map',
      'notfound' : 'notfound',
      'error' : 'error',
      '*other'    : 'defaultRoute'
  },

  initialize: function() {
    this.bind('route', this._pageView);
  },

  _pageView: function() {
    var path = Backbone.history.getFragment();
    //console.log("/" + path);
    ga('send', 'pageview', {page: "/" + path});
  },

  home: function(){
    var m = App.getUserModel(),
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
    var v = new App.View.MapList({
      'model' : new App.Model.User({'account' : account})
    });
    App.showView(v,{'renderMode': 'after'});
  },

  map: function(account,viz){
    // var viz = '8260e444-0bd3-11e6-a226-0e3ff518bd15';
    var v = new App.View.Map({
      'model' : new Backbone.Model({'viz': viz,'account': account})
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
