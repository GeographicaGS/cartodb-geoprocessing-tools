'use strict';

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
  if (!App.Config.Data.ONPREMISE){
      return Mustache.render(App.Config.Data.IMPORT_API_URL,{'user': user});
  }
  else{
    return App.Config.Parser('IMPORT_API_URL',{'user': user});
  }
}

App.Config.get_api_key_url = function(user){
  return App.Config.Parser('GET_API_KEY_URL',{'user': user});
}

App.Config.table_list_url = function(user, page, pagesize){
  if (user)
  return App.Config.Parser('TABLE_LIST_URL',{'user': user, 'page': page, 'pagesize': pagesize});
}
