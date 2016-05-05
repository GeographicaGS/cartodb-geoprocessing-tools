var App = App || {};

App.Config.Data = {
  'SQL_API_URL' : 'https://{{username}}.cartodb.com/api/v2/sql',
  'VIZ_API_URL' : 'http://{{username}}.cartodb.com/api/v2/viz/{{viz}}/viz.json',
  'CFG_TABLE_NAME' : 'cdb_geoproctool'
}

App.Config.Parser = function(key,bindings){
  return Mustache.render(App.Config.Data[key],bindings);
}

App.Config.viz_api_url = function(username,viz){
  return App.Config.Parser('VIZ_API_URL',{'username': username, 'viz' : viz});
}

App.Config.sql_api_url = function(username){
  return App.Config.Parser('SQL_API_URL',{'username': username});
}