'use strict';

var ENTER_KEY = 13;

Backbone.View.prototype.close = function(){
  this.remove();
  this.unbind();

  if (this.onClose){
  this.onClose();
  }
}

$(function() {
  ga('create', App.Config.Data.GA, 'auto');

  $(document).ajaxError(function(event, jqxhr) {
    if (jqxhr.status == 404) {
      //App.router.navigate('notfound',{trigger: true});
    }else if (jqxhr.status === 401) {
      // App.resetUserModel();
      App.router.navigate('login',{trigger: true});
    } else {
      //App.router.navigate('error',{trigger: true});
    }
  });

  $('body').on('click','a',function(e){
    var attr = $(this).attr('jslink'),
      href = $(this).attr('href');

    if (attr!= undefined && attr!='undefined'){
      e.preventDefault();
      if (href=='#back') {
        history.back();
      }
      App.router.navigate(href,{trigger: true});
    }
  });

  App.lang = App.detectCurrentLanguage();

  if (App.lang){
    // get locales
    // $.getJSON(App.config.PATRIMONIO_PATH + '/locales/' + App.lang+'.json',function(locales){
    //   App.locales = locales;
    //   App.ini();
    // });
    App.ini();
  }
  else{
    App.ini();
  }

  $(document).resize(function(){
    App.resizeMe();
  });

});

App.resizeMe = function(){

};

App.detectCurrentLanguage = function(){
  // Detect lang analyzing the URL
  if (document.URL.indexOf('/es/') != -1 || document.URL.endsWith('/es')) {
    return 'es';
  }
  else if (document.URL.indexOf('/en/') != -1 || document.URL.endsWith('/en')) {
    return 'en';
  }

  return null;
};


App.showView = function(view,opts) {

  var oldView = this.currentView;
  this.currentView = view;

  opts = _.defaults(opts || {},{'renderMode': 'before'});

  if (opts.renderMode=='before'){
    view.render();
    this.$main.html(view.el);
    if (oldView)
      oldView.close();
  }
  else if (opts.renderMode=='after'){
    if (oldView)
      oldView.close();
    this.$main.html(view.el);
    view.render();
  }

  this.scrollTop();
};


App.closeCurrentView = function(){
  if (this.currentView){
    this.currentView.close();
    this.currentView = null;
  }
};

App.events = {};

_.extend(App.events , Backbone.Events);


App.scrollTop = function(){
  var body = $('html, body');
  body.animate({scrollTop:0}, '500', 'swing', function() {

  });
}

App.scrollToEl = function($el){
  $('html, body').animate({
    scrollTop: $el.offset().top
  }, 500);
}

App.nl2br = function nl2br(str, is_xhtml) {
  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
}

// Tue, 25 Feb 2014 22:32:40 GMT
App.dateFormat = function(dateStr){
  var date = new Date(dateStr);

  var month = date.getMonth() + 1; //Months are zero based
  var day = date.getUTCDate();
  var year = date.getFullYear();

  if (day < 10) day = '0' + day;
  if (month < 10) month = '0' + month;
  return day +'/'+month+'/'+year;
}

/* dateStr must be a date in GMT Tue, 25 Feb 2014 22:32:40 GMT*/
App.dateTimeFormat = function(dateStr){
  var date = new Date(dateStr);

  var month = date.getMonth() + 1; //Months are zero based
  var day = date.getUTCDate();
  var year = date.getFullYear();
  var hours = date.getHours();
  var minutes = date.getMinutes();

  if (month < 10) month = '0' + month;
  if (day < 10) day = '0' + day;
  if (hours < 10) hours = '0' + hours;
  if (minutes < 10) minutes = '0' + minutes;

  return day +'/'+month+'/'+year +' - ' + hours + ':' + minutes ;
}

/* number format*/
App.nbf = function (n){

  var lang = this.lang || 'en';
  if (n===null){
      return "--";
  }

  if (isNaN(n)){
    return n;
  }
  else{
    return parseFloat(parseFloat(n).toFixed(2)).toLocaleString(lang);
  }
}

App.loading = function(){
  return '<div class="loading-ico"><svg viewBox="-10 -10 220 220"><path d="M200,100 C200,44.771525 155.228475,0 100,0 C44.771525,0 0,44.771525 0,100 C0,155.228475 44.771525,200 100,200 C155.228475,200 200,155.228475 200,100 Z" stroke-dashoffset="0"></path></svg></div>';
}

App.ini = function(){

  this.$main = $('main');
  this.router = new App.Router();

  var _this = this;
  this._userModel = new App.Model.UserLocalStorage();

  this._userModel.fetch({
    'success' : function(a,b){
      _this._userModel.validateAndCreate(function(){
        Backbone.history.start({pushState: true});
      });
    }
  });
}

App.functionToString = function(f){
  if(f == 'sum'){
    return 'Sum';
  }else if(f == 'min'){
    return 'Minimum';
  }else if(f == 'max'){
    return 'Maximum'
  }else if(f == 'avg'){
    return 'Average'
  }

  return '';
}

App.getUserModel = function(){
  return this._userModel;
}

App.resetUserModel = function(){
  this._userModel.destroy();
  localStorage.clear();
  this._userModel = new App.Model.UserLocalStorage();
}

App.onAjaxError = function(status){
  switch(status) {
    case 401:
      //this.resetUserModel();
      //this.router.navigate('login', {trigger: true});
      this.router.navigate('', {trigger: true});
      console.log('EEE!');
      break;
    default:
      console.error('Error on AJAX request: ' + status);
  }
}
