'use strict';

var App = App || {};

App.Config.Data = {
  'BASE_URL' :'https://{{user}}.cartodb.com',
  'SQL_API_URL': '/api/v2/sql',
  'VIZ_API_URL' : '/api/v2/viz/{{viz}}/viz.json',
  'IMPORT_API_URL': 'https://cartodb-importapi-proxy.geographica.gs/{{user}}',
  'CFG_TABLE_NAME' : 'cdb_geoproctool',
  'GET_API_KEY_URL': '/your_apps',
  'TABLE_LIST_URL': '/api/v1/viz/?tag_name=&q={{query}}&page={{page}}&type=&exclude_shared=false&per_page={{pagesize}}&tags=&shared=no&locked=false&only_liked=false&order=updated_at&types=derived&deepInsights=false',
  'DEBUG' : false,
  'ONPREMISE' : false,
  'GA': 'UA-66042906-5'
}
