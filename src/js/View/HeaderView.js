'use strict';

App.View.Header = Backbone.View.extend({

  events: {
    'click .back-btn': 'goBack'
  },

  initialize: function(options) {
    var section = this.model.get('section');

    if(section == 'map'){
      this._template = _.template( $('#map_header_template').html() );
    }else if(section == 'maplist'){
      this._template = _.template( $('#maplist_header_template').html() );
    }

    if (!this.model.get('title'))
      this.model.set('title','Untitled map');

    this.userControl = new App.View.UserControl({
      model: App.getUserModel(),
      account: this.model.get('account')
    });

  },

  onClose: function(){
    this.stopListening();
  },

  remove: function(){
    this.stopListening();
    this.$el.empty();
    return this;
  },

  render: function(){
    this.$el.html(this._template({title: this.model.get('title')}));

    this.userControl.setElement(this.$('.user'));
    this.userControl.render();

    return this;
  },

  goBack: function(e) {
    e.preventDefault();
    window.history.back();
  }

});
