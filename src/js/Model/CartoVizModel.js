App.Model.CartoViz = App.Model.Viz.extend({
  
  url: function(){
    return App.Config.viz_api_url(this.get('account'),this.get('id'));
  },
  
  sync: function(method, model, options){

    if (method == 'read'){
      options.dataType = 'jsonp';
      return Backbone.sync(method, model, options);
    }
    else
    {
      throw 'Unsupported method at CartoViz Model';
    }
  }
});

