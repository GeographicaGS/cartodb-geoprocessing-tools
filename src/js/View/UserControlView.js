'use strict';

App.View.UserControl = Backbone.View.extend({
  _template: _.template( $('#usercontrol_template').html() ),

  events: {
    'click .username' : '_clickUsername'
  },

  initialize: function(options) {
    this._account = options.account;
    this.listenTo(this.model,'change',this._renderSaveStatus);
  },

  onClose: function(){

    this.stopListening();
  },

  _renderSaveStatus: function(){
    var $st = this.$('.save-status');

    if (this.model.get('account')!= this._account)
      $st.attr('data-status','notallowed');
    else
      $st.attr('data-status',this.model.get('autosave'));

  },

  render: function(){
    this.$el.html(this._template({m: this.model.toJSON(),account: this._account}));
    // this._renderSaveStatus();

    return this;
  },

  _clickUsername: function(){

    if (!this.model.get('account')){
      // No logged user
      return App.router.navigate('login', {trigger: true});
    }

    if (!this._autoSaveView){
      this._autoSaveView = new App.View.UserAutosave({
        model: this.model,
        account: this._account
      });
      this.$('.autosave-holder').html(this._autoSaveView.render().$el);
    }
    else{
      this._autoSaveView.close();
      this._autoSaveView = null;
    }
  }

});


App.View.UserAutosave = Backbone.View.extend({
  _template: _.template( $('#user_autosave_template').html() ),

  initialize: function(options) {
    this._account = options.account;
    this.listenTo(this.model,'change:autosave',this._render);
    //this.listenTo(this.model,'change:api_key',this._render);
  },

  onClose: function(){
    this.stopListening();
  },

  events: {
    'click .toggle' : '_changeStatus',
    'keyup input' : '_updateAPIKeyTimer',
    'click #closeSession': '_closeSession'
  },

  _render: function(){
    var api_key = this.model.get('api_key'),
        autosave = this.model.get('autosave');
    this.$toggle = this.$('.toggle');
    this.$el.attr('data-status',autosave);
    if(autosave == 'waiting' || autosave == 'enabled'){
      this.$toggle.addClass('enabled');
    }

    this.$('input').val(api_key);

    this.$('.co_api_key').removeClass('validating');

    if (api_key && autosave=='waiting')
      this.$el.addClass('issue');
    else
      this.$el.removeClass('issue');

  },

  _changeStatus: function(e){
    var st = this.model.get('autosave');

    if (st == 'enabled' || st == 'waiting'){
      this.model.set({
        'autosave':'disabled',
        'api_key' : null
      }).save();
      this.$toggle.removeClass('enabled');
    }
    else if (st == 'disabled'){
      this.model.set('autosave','waiting').save();
      this.$toggle.addClass('enabled');
    }
  },

  _updateAPIKeyTimer: function(){

    this.$el.addClass('checking');

    if (this._apikeyTimeout)
      clearTimeout(this._apikeyTimeout);

    var _this = this;
    this._apikeyTimeout = setTimeout(function(){
      clearTimeout(_this._apikeyTimeout);
      _this._updateAPIKey();
    },750);
  },

  _updateAPIKey: function(){

    this.model.set('api_key',$.trim(this.$('input').val()));

    var _this = this;
    this.model.validateAPIKey(function(cb){
      _this.model.set('autosave',cb ? 'enabled' : 'waiting');
      _this.model.createConfigTable();
      _this.model.save();
      _this.$el.removeClass('checking');
    });

  },

  render: function(){
    this.$el.html(this._template({m: this.model.toJSON(), account: this._account, api_key_url: App.Config.get_api_key_url(this._account)}));
    this._render();
    return this;
  },

  _closeSession: function(e) {
    e.preventDefault();
    App.resetUserModel();
    App.router.navigate('login', {trigger: true});
  }

});
