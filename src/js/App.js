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

  $(document).ajaxError(function(event, jqxhr) {
    if (jqxhr.status == 404) {
      //App.router.navigate('notfound',{trigger: true});
    }
    else {
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
  }
  else if (opts.renderMode=='after'){
    this.$main.html(view.el);
    view.render(); 
  }

  if (oldView)
    oldView.close();

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
  return '<div class="loading"></div>';
}

App.ini = function(){


  this.$main = $('main');
  this.router = new App.Router();
  
  this._userModel = new App.Model.UserLocalStorage();
  this._userModel.fetch({
    'success' : function(){
      Backbone.history.start({pushState: true});  
    }
  });
  
}

App.getUserModel = function(){
  
  return this._userModel;
}
