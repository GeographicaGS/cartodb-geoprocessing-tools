'use strict';

App.View.Header = Backbone.View.extend({
  _template: _.template( $('#header_template').html() ),

  initialize: function(options) {
    this.userControl = new App.View.UserControl();
  },

  onClose: function(){

    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template());

    this.userControl.setElement(this.$('.user'));
    this.userControl.render();

    return this;
  }

});
