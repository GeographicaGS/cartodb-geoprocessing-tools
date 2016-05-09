'use strict';

App.View.Footer = Backbone.View.extend({
  _template: _.template( $('#footer_template').html() ),

  initialize: function(options) {

  },

  onClose: function(){},

  remove: function(){
    this.stopListening();
    this.$el.empty();
    return this;
  },

  render: function(options){
    var options = options || {classes: ''};
    this.$el.html(this._template(options));

    return this;
  }

});
