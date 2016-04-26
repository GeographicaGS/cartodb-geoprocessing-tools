'use strict';

App.View.Account = Backbone.View.extend({
  _template: _.template( $('#account_template').html() ),
  
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
