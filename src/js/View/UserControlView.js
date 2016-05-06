'use strict';

App.View.UserControl = Backbone.View.extend({
  _template: _.template( $('#usercontrol_template').html() ),

  initialize: function(options) {
    this._account = options.account;
    this.listenTo(this.model,'change',this._renderSaveStatus);

  },

  onClose: function(){

    this.stopListening();
  },

  events: {
    'click .save-status' : '_toggleAutoSave'
  },

  _renderSaveStatus: function(){
    var $st = this.$('.save-status');

    if (this.model.get('account')!= this._account)
      $st.addClass('notallowed');
    else if (this.model.get('autosave') && this.model.get('api_key'))
      $st.addClass('enabled');
    else
      $st.addClass('disabled');

  },

  render: function(){
    this.$el.html(this._template({m: this.model.toJSON(),account: this._account}));
    this._renderSaveStatus();

    return this;
  },

  _toggleAutoSave: function(){

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
  },

  onClose: function(){

    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template({m: this.model.toJSON(), account: this._account}));
    return this;
  }

});
