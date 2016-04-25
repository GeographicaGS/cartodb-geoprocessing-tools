'use strict';

App.View.Error404 = Backbone.View.extend({
  _template: _.template($('#404_template').html()),

  render: function(){
    this.$el.html(this._template());
    return this;
  }
});

App.View.Error500 = Backbone.View.extend({
  _template: _.template($('#500_template').html()),

  render: function(){
    this.$el.html(this._template());
    return this;
  }
});
