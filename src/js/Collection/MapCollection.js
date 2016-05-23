'use strict';

App.Collection.Map = Backbone.Collection.extend({
  _username: null,
  _nrecords : null,
  _pageSize : 16,
  _page: 1,
  _query: '',

  initialize: function(options) {
      this._username = options.username;
      if (options.pageSize){
          this._pageSize = options.pageSize;
      }
  },

  url: function(){
    return App.Config.table_list_url(this._username, this._page, this._pageSize,this._query);
    // "https://"+this._username+".cartodb.com/api/v1/viz/?tag_name=&q=&page="+this._page+"&type=&exclude_shared=false&per_page="+this._pageSize+"&tags=&shared=no&locked=false&only_liked=false&order=updated_at&types=derived&deepInsights=false";
    // "https://"+this._username+".cartodb.com/api/v1/viz?types=table%2Cderived&privacy=public&exclude_shared=true&per_page="+this._pageSize+"&order=updated_at&page="+this._page;
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

  getCurrentQuery: function() {
    return this._query;
  },

  getNrecords: function(next){
      return this._nrecords;
  },

  parse: function(result){
    this._nrecords = result.total_entries;
    return result.visualizations;
  },

  setCurrentPage: function(page){
      this._page = page;
  },

  setCurrentQuery: function(query){
    this._query = query;
  },

  sync: function(method, collection, options){
    options.dataType = 'jsonp';
    return Backbone.sync(method, collection, options);
  }
});
