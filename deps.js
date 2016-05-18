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
  srcJS + 'lib/clipboard.js',
  srcJS + 'lib/leaflet.draw-src.js',

  // Namespace
  srcJS + 'Namespace.js',

  // Namespace
  srcJS + 'Config.js',

  srcJS + 'Utils.js',

  // Models
  srcJS + 'Model/UserModel.js',
  srcJS + 'Model/VizModel.js',
  srcJS + 'Model/CartoVizModel.js',
  srcJS + 'Model/GeoVizModel.js',
  srcJS + 'Model/ReportModel.js',
  srcJS + 'Model/WizardModel.js',
  srcJS + 'Model/BufferModel.js',

  // Collections
  srcJS + 'Collection/MapCollection.js',
  srcJS + 'Collection/ReportCollection.js',

  // Views
  srcJS + 'View/AccountView.js',
  srcJS + 'View/MapListView.js',
  srcJS + 'View/MapView.js',
  srcJS + 'View/ErrorView.js',
  srcJS + 'View/UserControlView.js',
  srcJS + 'View/HeaderView.js',
  srcJS + 'View/FooterView.js',
  srcJS + 'View/GroupLayerView.js',
  srcJS + 'View/LayerControlView.js',
  srcJS + 'View/MapToolbarView.js',
  srcJS + 'View/MapView.js',
  srcJS + 'View/ReportView.js',
  srcJS + 'View/BasemapView.js',

  // Tool Views
  srcJS + 'View/Tool/StatisticalView.js',
  srcJS + 'View/Tool/OverlayView.js',
  srcJS + 'View/Tool/BufferView.js',
  srcJS + 'View/Tool/BookmarksView.js',
  srcJS + 'View/Tool/Measure.js',

  // Router
  srcJS + 'Router.js',

  // app
  srcJS + 'App.js'
];

deps.lessFile = src + 'css/styles.less';

if (typeof exports !== 'undefined') {
  exports.deps = deps;
}
