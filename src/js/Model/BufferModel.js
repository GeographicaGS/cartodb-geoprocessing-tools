'use strict';

App.Model.Tool.Buffer = App.Model.Wizard.CartoCSS.extend({
  defaults: {
    'input': null,
    'name':null,
    // Could be input or field
    'type' : 'input',
    'type_input' : null,
    'unit' : 'km',
    'type_field': null,
    'fields': null,
    'disolve':false
  }
});
