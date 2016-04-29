'use strict';

App.View.Header = Backbone.View.extend({
  _title: '',

  initialize: function(options) {
    var options = options || {section: 'map', title: 'Untitled map'};
    if(options.section == 'map'){
      this._template = _.template( $('#map_header_template').html() );
    }else if(options.section == 'maplist'){
      this._template = _.template( $('#maplist_header_template').html() );
    }
    this._title = options.title;
    this.userControl = new App.View.UserControl();
  },

  onClose: function(){

    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template({title: this._title}));

    this.userControl.setElement(this.$('.user'));
    this.userControl.render();

    return this;
  }

});
