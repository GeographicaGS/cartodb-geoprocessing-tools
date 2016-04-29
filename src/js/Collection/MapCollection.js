'use strict';

App.Collection.Map = Backbone.Collection.extend({
  _username: null,
  _nrecords : null,
  _pageSize : 10,
  _page: 1,

  initialize: function(options) {
      this._username = options.username;
      if (options.pageSize){
          this._pageSize = options.pageSize;
      }
  },

  url: function(){
    return "https://"+this._username+".cartodb.com/api/v1/viz?types=table%2Cderived&privacy=public&exclude_shared=true&per_page="+this._pageSize+"&order=updated_at&page="+this._page;
  },

  nextPage: function(){
      this._page++;
      return this._page;
  },

  previousPage: function(){
      if (this._page)
          this._page--;

      return this._page;
  },

  getCurrentPage: function(){
      return this._page;
  },

  getNrecords: function(next){
      return this._nrecords;
  },

  parse: function(result){
    this._nrecords = result.total_entries;
    return result.visualizations;
  },

  sync: function(method, collection, options){
    options.dataType = 'jsonp';
    return Backbone.sync(method, collection, options);
  }
});
