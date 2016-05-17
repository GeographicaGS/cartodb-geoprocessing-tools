'use strict';

App.View.Report = Backbone.View.extend({
  _template: _.template( $('#report_template').html() ),
  _template_fields: _.template( $('#report_fields_template').html() ),

  initialize: function(options) {
  	_.bindAll(this,'_onFetchModel');
  	this._map = options.map;
  	this._geoVizModel = options.geoVizModel;
  	this.reportCollection = new App.Collection.Report();
  	var _this = this;
  	_.each(this._geoVizModel.get('reports'),function(m) {
  		_this.reportCollection.add(new App.Model.Report(m));
  	});
  	this.listenTo(this.reportCollection,'add', this.render);
  },

  events: {
    'click .viewport .toggle' : '_toggleViewport',
    'click .viewport .remove' : '_removeQuestion',
    'click .viewport .cancel_remove' : '_cancelRemove',
    'click .viewport .confirm_remove' : '_removeReport',
    'click .title' : '_toggleReportList',
    'click .report_popup li' : '_selectReport',
    'click .no_reports a' : 'show_statistical',
  },

  onClose: function(){
    this.stopListening();
  },

  render: function(){
    this.$el.html(this._template({
    	'reports':this.reportCollection.toJSON()
    }));

    this._currentIndex = this.reportCollection.length - 1;

    this.renderReport(); 

    return this;
  },

  renderReport:function(){
  	// if(this.reportCollection.length > 0){
  	if(this._currentIndex >= 0){
    	var model = this.reportCollection.at(this._currentIndex).clone();
    	model.set('account',this._geoVizModel.get('account'));
    	if(this.$('.viewport .toggle').hasClass('enabled'))
    		model.set('geom',this._map.getBounds());
    	else
    		model.set('geom',null);

    	model.fetch({
    		success:this._onFetchModel,
        error:this._onFetchModel
    	});
    }
  },

  _onFetchModel: function(data,result){
  	this.$('.report').html(this._template_fields({'report':data, 'errors':result.errors, 'reports':this.reportCollection.toJSON()}));
  },

  _toggleViewport:function(e){
  	var _this = this;
  	$(e.currentTarget).toggleClass('enabled');
  	$(e.currentTarget).next('span').toggleClass('enabled');
  	this.renderReport();

  	if($(e.currentTarget).hasClass('enabled')){
  		this._map.on('moveend',function(e){
	      _this.renderReport();
	    });
  	}else{
  		this._map.off('moveend');
  	}
  },

  _toggleReportList:function(){
  	this.$('.report_popup').toggleClass('activated');
  },

  _selectReport:function(e){
  	$(e.currentTarget).removeClass('activated');
  	this._currentIndex = parseInt($(e.currentTarget).attr('index'));
  	this.renderReport();
  },

  _removeQuestion:function(e){
  	e.preventDefault();
  	$(e.currentTarget).addClass('hide');
  	this.$('.viewport .toggle ').addClass('hide');
  	this.$('.viewport span ').addClass('hide');
  	this.$('.viewport .remove_block').addClass('activated');

  },

  _removeReport:function(e){
  	e.preventDefault();
  	this.reportCollection.remove(this.reportCollection.at(this._currentIndex))
  	this._currentIndex = this.reportCollection.length - 1;
  	
  	this._geoVizModel.set('reports',this.reportCollection.toJSON());
    this._geoVizModel.save();

  	this.render();
  },

  _cancelRemove:function(e){
  	e.preventDefault();
  	this.$('.viewport .remove ').removeClass('hide');
  	this.$('.viewport .toggle ').removeClass('hide');
  	this.$('.viewport span ').removeClass('hide');
  	this.$('.viewport .remove_block').removeClass('activated');
  },

  show_statistical:function(e){
    e.preventDefault();
    this.trigger('open_statistical');
  },

});
