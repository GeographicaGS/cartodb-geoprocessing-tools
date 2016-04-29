'use strict';

App.View.UserControl = Backbone.View.extend({
  _template: _.template( $('#usercontrol_template').html() ),
  _username: '',

  initialize: function(options) {
    var accountInfo = localStorage.getItem('user');
    if (accountInfo)
      this._username = JSON.parse(accountInfo).account;
  },

  onClose: function(){

    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template({username: this._username}));

    return this;
  }

});
