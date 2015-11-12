import app from './app.module.js';

{

  const appTest = angular.module('appTest', ['ngMock', app.name]);

  window.addEventListener('load', () => {
    return angular.bootstrap(window.document, [appTest.name], {strictDi: true});
  });

}
