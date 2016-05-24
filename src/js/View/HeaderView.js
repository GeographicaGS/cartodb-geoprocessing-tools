'use strict';

App.View.Header = Backbone.View.extend({

  initialize: function(options) {
    var section = this.model.get('section');

    if(section == 'map'){
      this._template = _.template( $('#map_header_template').html() );
    }else if(section == 'maplist'){
      this._template = _.template( $('#maplist_header_template').html() );
      this.model.set('title', this.model.get('account'));
    }

    if (!this.model.get('title'))
      this.model.set('title','Untitled map');

    this._userModel = App.getUserModel();
    this.userControl = new App.View.UserControl({
      model: this._userModel,
      account: this.model.get('account')
    });

  },

  onClose: function(){

    if (this.userControl)
      this.userControl.close();

  },

  remove: function(){
    this.stopListening();
    this.$el.empty();
    return this;
  },

  render: function(){

    this.$el.html(this._template({title: this.model.get('title'), account: this.model.get('account')}));
    this.$title = this.$('h1');
    this.userControl.setElement(this.$('.user'));
    this.userControl.render();

    return this;
  },

  updateTitle: function(newTitle){
    var html = newTitle;
    if (this.model.get('account')!= this._userModel.get('account'))
      html += '<span class="author">@' + this.model.get('account') + '</span>';

    this.$title.html(html);
  }

});
