App.View.Measure = Backbone.View.extend({
  _template: _.template( $('#measure_template').html() ),

  initialize: function(options) { 
  },

  events: {
  },

  render: function(){
    this.$el.html(this._template());
    return this;
  }

});