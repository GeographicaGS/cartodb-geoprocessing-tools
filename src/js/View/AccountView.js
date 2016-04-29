'use strict';

App.View.Account = Backbone.View.extend({
  _template: _.template( $('#account_template').html() ),

  initialize: function(options) {
    this.footer = new App.View.Footer();
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

    this.$submit.removeClass('error').removeClass('ready');
    this.$username.removeClass('error');
    if(this.$username.val() != ''){
      this.$submit.addClass('loading');
    }


    if (this._usernameTimeout)
      clearTimeout(this._usernameTimeout);

    var _this = this;
    this._usernameTimeout = setTimeout(function(){
      clearTimeout(_this._usernameTimeout);
      _this.model.set('account',$(e.target).val());
    },500);

  },

  _changeAccountStatus: function (st) {
    if (st){
      this.$username.removeClass('error');
      this.$submit.removeClass('error').removeClass('loading').addClass('ready');
    }
    else{
      this.$username.addClass('error');
      this.$submit.removeClass('ready').removeClass('loading').addClass('error');
    }
  },

  render: function(){
    this.setElement(this._template());

    this.footer.setElement($('footer'));
    this.footer.render({classes: 'login'});

    this.$username = this.$('input[name="username"]');
    this.$submit = this.$('.submit');

    return this;
  },

  _onClickGo: function(e){
    e.preventDefault();
    this.$submit.addClass('loading');

    if (this.model.get('account_status')){
      this.model.unset('account_status');
      this.model.save();
      App.router.navigate(this.model.get('account') + '/map_list',{'trigger' : true});
    }else{
      this.$submit.removeClass('loading');
    }

  }

});
