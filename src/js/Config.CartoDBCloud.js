'use strict';

var App = App || {};


App.Config.Data = {
  'SQL_API_URL' : 'https://{{user}}.cartodb.com/api/v2/sql',
  'VIZ_API_URL' : 'http://{{user}}.cartodb.com/api/v2/viz/{{viz}}/viz.json',
  'IMPORT_API_URL': 'http://cartodb-importapi-proxy.geographica.gs/{{user}}',
  'CFG_TABLE_NAME' : 'cdb_geoproctool',
  'GET_API_KEY_URL': 'https://{{user}}.cartodb.com/your_apps',
  'TABLE_LIST_URL': 'https://{{user}}.cartodb.com/api/v1/viz/?tag_name=&q=&page={{page}}&type=&exclude_shared=false&per_page={{pagesize}}&tags=&shared=no&locked=false&only_liked=false&order=updated_at&types=derived&deepInsights=false',
  'DEBUG' : true
}
