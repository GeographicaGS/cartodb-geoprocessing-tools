'use strict';

App.View.UserControl = Backbone.View.extend({
  _template: _.template( $('#usercontrol_template').html() ),

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
