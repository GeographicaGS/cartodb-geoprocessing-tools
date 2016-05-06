'use strict';

App.View.MapList = Backbone.View.extend({
  _template: _.template( $('#maplist_template').html() ),
  _template_item: _.template( $('#maplist_item_template').html() ),
  id: 'maplist',

  initialize: function(options) {
    this.header = new App.View.Header({section: 'maplist', title: this.model.get('account'), username: this.model.get('account')});
    this.footer = new App.View.Footer();

    _.bindAll(this,'_onAccountChecked');
    this.collection = new App.Collection.Map({username: this.model.get('account')});
    this.listenTo(this.collection, 'reset', this.refreshList);
  },

  onClose: function(){
    this.stopListening();
  },

  _onAccountChecked: function(st){
    if (st){
      this.$el.html(this._template({'model': this.model.toJSON()}));
      this.$maplist = this.$('.maplist');
      this.$mapNumber = this.$('.toolbar h2 span');
      this.collection.fetch({reset: true});
    }
    else{
      this.$el.html('User does not exist');
    }
  },
  render: function(){
    this.header.setElement($('header'));
    this.footer.setElement($('footer'));
    this.header.render();
    this.footer.render();
    // Show a loading whereas check if the account exist
    this.$el.html(App.loading());

    this.model.checkAccount(this.model.get('account'),this._onAccountChecked);

    return this;
  },

  refreshList: function(){
    this.$mapNumber.html(this.collection.getNrecords());
    var $maplist_ul = this.$maplist.children('ul').first();
    $maplist_ul.empty();
    var that = this;
    var account = this.model.get('account');
    this.collection.each(function(item){
      var item_el = that._template_item({account: account , map: item.toJSON()});
      $maplist_ul.append(item_el);
    });
  }

});

/*
<% if(maps){ %>
  <ul>
  <% _.each(maps, function(map){ %>
    <li><a href="<%= map.id %>"><%= map.name %></a></li>
  <% }); %>
  </ul>
<% }else{ %>
  <p>Sorry, there's no maps available</p>
<% } %>
*/
