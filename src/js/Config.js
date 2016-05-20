var App = App || {};

// App.Config.Data = {
//   'SQL_API_URL' : 'https://{{user}}.cartodb.com/api/v2/sql',
//   'VIZ_API_URL' : 'http://{{user}}.cartodb.com/api/v2/viz/{{viz}}/viz.json',
//   'IMPORT_API_URL': 'http://cartodb-importapi-proxy.geographica.gs/{{user}}',
//   'CFG_TABLE_NAME' : 'cdb_geoproctool',
//   'GET_API_KEY_URL': 'https://{{user}}.cartodb.com/your_apps',
//   'TABLE_LIST_URL': 'https://{{user}}.cartodb.com/api/v1/viz/?tag_name=&q=&page={{page}}&type=&exclude_shared=false&per_page={{pagesize}}&tags=&shared=no&locked=false&only_liked=false&order=updated_at&types=derived&deepInsights=false',
//   'DEBUG' : true
// }

App.Config.Data = {
  'BASE_URL' :'https://sla-training.cartodb.solutions/user/{{user}}',
  'SQL_API_URL': '/api/v2/sql',
  'VIZ_API_URL' : '/api/v2/viz/{{viz}}/viz.json',
  'IMPORT_API_URL': 'http://cartodb-importapi-proxy.geographica.gs/{{user}}',
  'CFG_TABLE_NAME' : 'cdb_geoproctool',
  'GET_API_KEY_URL': '/your_apps',
  'TABLE_LIST_URL': '/api/v1/viz/?tag_name=&q=&page={{page}}&type=&exclude_shared=false&per_page={{pagesize}}&tags=&shared=no&locked=false&only_liked=false&order=updated_at&types=derived&deepInsights=false',
  'DEBUG' : false,
  'ONPREMISE' : true
}

App.Config.Parser = function(key,bindings){
  return Mustache.render(App.Config.Data.BASE_URL + App.Config.Data[key],bindings);
}

App.Config.viz_api_url = function(user,viz){
  return App.Config.Parser('VIZ_API_URL',{'user': user, 'viz' : viz});
}

App.Config.sql_api_url = function(user){
  return App.Config.Parser('SQL_API_URL',{'user': user});
}

App.Config.cartodbjs_sql_api_url = function(){
  return App.Config.Data.BASE_URL.replace(/{{/g,'{').replace(/}}/g,'}');
}

App.Config.cartodbjs_maps_api_url = function(){
  return App.Config.Data.BASE_URL.replace(/{{/g,'{').replace(/}}/g,'}');
}

App.Config.import_api_url = function(user){
  return Mustache.render(App.Config.Data.IMPORT_API_URL,{'user': user});
}

App.Config.get_api_key_url = function(user){
  return App.Config.Parser('GET_API_KEY_URL',{'user': user});
}

App.Config.table_list_url = function(user, page, pagesize){
  if (user)
  return App.Config.Parser('TABLE_LIST_URL',{'user': user, 'page': page, 'pagesize': pagesize});
}
