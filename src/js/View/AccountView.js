'use strict';

App.View.Account = Backbone.View.extend({
  _template: _.template( $('#account_template').html() ),
  
  initialize: function(options) {
    this.listenTo(this.model,'change:account:status',this._changeAccountStatus);
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
      _this.model.set('account',$(e.target).val());
    },500);
    
  },

  _changeAccountStatus: function (st) {
    var $p = this.$('#invalid_user_text');

    if (st){
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

    if (this.model.get('account_status')){
      this.model.unset('account_status');
      this.model.save();
      App.router.navigate(this.model.get('account') + '/map_list',{'trigger' : true});  
    }
    
  }

});
