'use strict';

App.View.Home = Backbone.View.extend({
  _template: _.template( $('#home_template').html() ),
  
  initialize: function(options) {
    
  },

  onClose: function(){
    
    this.stopListening();        
  },

  render: function(){
    
    this.$el.html(this._template());

    return this;
  }

});
