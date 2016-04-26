var deps = {};

var src = 'src/',
  srcJS = src + 'js/';

//deps.envFile = 'config.yml';  
deps.templateFolder = [srcJS + 'template'];
// deps.config = srcJS + 'Config.js';

deps.JS = [
  srcJS + 'lib/jquery-2.1.3.js',
  srcJS + 'lib/underscore-1.8.2.js',
  srcJS + 'lib/backbone-1.1.2.js',

  // Namespace
  srcJS + 'Config.js',

  // Namespace
  srcJS + 'Namespace.js',

  // Models
  srcJS + 'Model/UserModel.js',
  
  // Views
  srcJS + 'View/AccountView.js',
  srcJS + 'View/ErrorView.js',
  
  // Router
  srcJS + 'Router.js',

  // app
  srcJS + 'App.js'
];

deps.lessFile = src + 'css/styles.less';

if (typeof exports !== 'undefined') {
  exports.deps = deps;
}
