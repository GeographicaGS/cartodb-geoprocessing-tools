var App = App || {};

App.Config.Data = {
  'SQL_API_URL' : 'https://{{username}}.cartodb.com/api/v2/sql',
  'VIZ_API_URL' : 'http://{{username}}.cartodb.com/api/v2/viz/{{viz}}/viz.json',
  'IMPORT_API_URL': 'http://cartodb-importapi-proxy.geographica.gs/{{username}}',
  //'IMPORT_API_URL': 'http://192.168.99.100:3000/{{username}}',
  'CFG_TABLE_NAME' : 'cdb_geoproctool',
  'GET_API_KEY_URL': 'https://{{username}}.cartodb.com/your_apps',
  'TABLE_LIST_URL': 'https://{{username}}.cartodb.com/api/v1/viz/?tag_name=&q=&page={{page}}&type=&exclude_shared=false&per_page={{pagesize}}&tags=&shared=no&locked=false&only_liked=false&order=updated_at&types=derived&deepInsights=false',
  'DEBUG' : true
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

App.Config.import_api_url = function(username){
  return App.Config.Parser('IMPORT_API_URL',{'username': username});
}

App.Config.get_api_key_url = function(username){
  return App.Config.Parser('GET_API_KEY_URL',{'username': username});
}

App.Config.table_list_url = function(username, page, pagesize){
  return App.Config.Parser('TABLE_LIST_URL',{'username': username, 'page': page, 'pagesize': pagesize});
}
