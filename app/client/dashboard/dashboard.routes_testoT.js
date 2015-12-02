'use strict';

const test = require('tape');
const testUtils = require('../utils/test-utils.js');

test('check dashboard routes', (t) => {
  const injector = angular.injector(['appTest']);
  const $httpBackend = injector.get('$httpBackend');
  const $rootScope = injector.get('$rootScope');
  const $location = injector.get('$location');
  const $state = injector.get('$state');

  const req1 = $httpBackend.when('GET', '/api/settings/findOne?filter=%7B%22where%22:%7B%22userId%22:%22public%22%7D%7D')
  .respond(200, {id: '1', langFallback: 'en', langsAvailables: ['en', 'es'], preferredLanguage: 'en'});

  const reqLayoutEn = $httpBackend.when('GET', '/api/settings/i18n/layout/en')
  .respond(200, {});

  const reqLoginEn = $httpBackend.when('GET', '/api/settings/i18n/login/en')
  .respond(200, {});

  const reqNgEn1 = $httpBackend.when('GET', '/i18n/angular-locale_en.js')
  .respond(200, {});

  //testUtils.checkRoute(t, $rootScope, $location, '/', $state, 'dashboard');
  $rootScope.$apply(() => $location.path('/'));
  t.comment(JSON.stringify($state.current));
  t.equal($state.current.name, 'dashboard', 'dashboard is default state');
  $httpBackend.flush();
  /*

  //testUtils.checkRoute(t, $rootScope, $location, '/', $state, 'dashboard');
  //testUtils.checkRoute(t, $rootScope, $location, '/panel-de-control', $state, 'dashboard');
  //testUtils.checkRoute(t, $rootScope, $location, '/home', $state, 'dashboard');
  //testUtils.checkRoute(t, $rootScope, $location, '/inicio', $state, 'dashboard');

  //let layout = {};
  //t.equal($state.current.views.content.controllerProvider[1](layout), 'DashboardController', 'user loggued access to dashboard');

  //layout.state.loggued = false;
  //t.equal($state.current.views.content.controllerProvider[1](layout), 'LoginController', 'guess user access to login');
  */
  t.end();

});
