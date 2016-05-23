'use strict';

var App = App || {};

App.Config.Data = {
  'BASE_URL' :'https://sla-training.cartodb.solutions/user/{{user}}',
  'SQL_API_URL': '/api/v2/sql',
  'VIZ_API_URL' : '/api/v2/viz/{{viz}}/viz.json',
  'IMPORT_API_URL': '/api/v1/imports',
  'CFG_TABLE_NAME' : 'cdb_geoproctool',
  'GET_API_KEY_URL': '/your_apps',
  'TABLE_LIST_URL': '/api/v1/viz/?tag_name=&q=&page={{page}}&type=&exclude_shared=false&per_page={{pagesize}}&tags=&shared=no&locked=false&only_liked=false&order=updated_at&types=derived&deepInsights=false',
  'DEBUG' : false,
  'ONPREMISE' : true
}
