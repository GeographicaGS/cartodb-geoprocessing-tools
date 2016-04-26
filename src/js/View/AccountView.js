'use strict';

App.View.Account = Backbone.View.extend({
  _template: _.template( $('#account_template').html() ),
  
  initialize: function(options) {
    this.model.set('account','');
    this.listenTo(this.model,'change:account',this._onChangeAccount);
  },

  events: {
    'keyup input[name="username"]' : '_onTypedUsername',
    'click input[type="submit"]' : '_onClickGo',
  },

  onClose: function(){
    this.stopListening();
  },

  _onTypedUsername: function(e){
    
    if (this._usernameTimeout)
      clearTimeout(this._usernameTimeout);

    var _this = this;
    this._usernameTimeout = setTimeout(function(){
      clearTimeout(_this._usernameTimeout);
      _this.model.setAccount($(e.target).val());
    },500);
    
  },

  _onChangeAccount: function (st) {
    var $p = this.$('#invalid_user_text'),
      account = this.model.get('account');

    if (account){
      $p.fadeOut();
    }
    else{
      $p.fadeIn();
    }
  },

  render: function(){
    this.$el.html(this._template());
    return this;
  },

  _onClickGo: function(e){
    e.preventDefault();

    var account = this.model.get('account');

    if (account){
      App.router.navigate(account + '/map_list',{'trigger' : true});  
    }
    
  }

});
