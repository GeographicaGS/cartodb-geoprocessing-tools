'use strict';

App.View.MapList = Backbone.View.extend({
  _template: _.template( $('#map_list_template').html() ),
  
  initialize: function(options) {
    _.bindAll(this,'_onAccountChecked');
  },

  onClose: function(){
    this.stopListening();
  },
  
  _onAccountChecked: function(st){
    if (st){
      this.$el.html(this._template({'model': this.model.toJSON()}));
    }
    else{
      this.$el.html('User does not exist');
    }
  },
  render: function(){
    // Show a loading whereas check if the account exist
    this.$el.html(App.loading());
    
    this.model.checkAccount(this.model.get('account'),this._onAccountChecked);

    return this;
  }

});
