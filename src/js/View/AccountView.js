'use strict';

App.View.Account = Backbone.View.extend({
  _template: _.template( $('#account_template').html() ),

  initialize: function(options) {
    this.footer = new App.View.Footer();
    this.listenTo(this.model,'change:account:status',this._changeAccountStatus);
  },

  events: {
    'keyup input[name="username"]' : '_onTypedUsername',
    'keyup input[name="apikey"]' : '_onTypedApiKey',
    'click input[type="submit"]' : '_onClickGo',
    'click .goNext': '_onClickNext',
    'click .goPrev': '_onClickPrev',
    'submit form': '_onEnterKey'
  },

  onClose: function(){
    this.stopListening();
  },

  _onTypedUsername: function(e){
    if (e.keyCode == 13) {
      if(this.$next.hasClass('ready')){
        this._onClickNext(e);
      }
    }else{
      this.$next.removeClass('error').removeClass('ready');
      this.$username.removeClass('error');
      if(this.$username.val() != ''){
        this.$next.addClass('loading');
      }

      if (this._usernameTimeout)
        clearTimeout(this._usernameTimeout);

      var _this = this;
      this._usernameTimeout = setTimeout(function(){
        clearTimeout(_this._usernameTimeout);
        _this.model.set('account',$(e.target).val());
      },500);
    }
  },

  _onTypedApiKey: function(e){

    this.$submit.removeClass('error').removeClass('ready');
    this.$apikey.removeClass('error');
    if(this.$apikey.val() != ''){
      this.$submit.addClass('loading');
    }


    if (this._usernameTimeout)
      clearTimeout(this._usernameTimeout);

    var _this = this;
    this._usernameTimeout = setTimeout(function(){
      clearTimeout(_this._usernameTimeout);
      _this.model.set('api_key',$.trim($(e.target).val()));
      _this.model.validateAPIKey(function(valid){
        _this.model.set('autosave',valid ? 'enabled' : 'waiting');
        if(valid){
          _this.model.createConfigTable(function(){
              _this.model.save();
              _this.$submit.addClass('ready').removeClass('loading');
          });
        }
        else{
          _this.$submit.addClass('error').removeClass('loading');
        }
      });
    },500);

  },

  _changeAccountStatus: function (st) {
    if (st){
      this.$username.removeClass('error');
      this.$next.removeClass('error').removeClass('loading').addClass('ready');
    }
    else{
      this.$username.addClass('error');
      this.$next.removeClass('ready').removeClass('loading').addClass('error');
    }
  },

  render: function(){
    this.setElement(this._template());

    this.footer.setElement($('footer'));
    this.footer.render({classes: 'login'});

    this.$username = this.$('input[name="username"]');
    this.$apikey = this.$('input[name="apikey"]');
    this.$next = this.$('.step.one .submit');
    this.$submit = this.$('.step.two .submit');
    this.$content = this.$('.content');

    return this;
  },

  _onClickNext: function(e){
    e.preventDefault();
    if(this.$next.hasClass('ready')){
      this.$content.get(0).className = "content two";
      var username = this.$username.val();
      this.$('.username').html(username);
      this.$('.externallink a').attr('href', App.Config.get_api_key_url(username));
      var _this = this;
      window.setTimeout(function () {
        _this.$apikey.focus();
      }, 500);
    }
  },

  _onClickPrev: function(e){
    e.preventDefault();
    this.$content.get(0).className = "content one";
    this.$username.focus();
  },

  _onClickGo: function(e){
    e.preventDefault();
    if(this.$submit.hasClass('ready')){
      this.$submit.addClass('loading');

      if (this.model.get('account_status')){
        this.model.unset('account_status');
        this.model.save();
        App.router.navigate(this.model.get('account') + '/map_list',{'trigger' : true});
      }else{
        this.$submit.removeClass('loading');
      }
    }
  },

  _onEnterKey: function(e){
    e.preventDefault();
    if(this.$submit.hasClass('ready')){
      this._onClickGo(e);
    }else if(this.$next.hasClass('ready')){
      this._onClickNext(e);
    }
  }

});
