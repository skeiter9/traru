'use strict';

const test = require('tape');
const testUtils = require('../utils/test-utils.js');

test('check dashboard routes', (t) => {

  const injector = angular.injector(['appTest']);
  const $httpBackend = injector.get('$httpBackend');
  const $rootScope = injector.get('$rootScope');
  const $location = injector.get('$location');
  const $state = injector.get('$state');

  //const routing = injector.get('routing');

  testUtils.checkRoute(t, $rootScope, $location, '', $state, 'dashboard');
  testUtils.checkRoute(t, $rootScope, $location, '/', $state, 'dashboard');
  testUtils.checkRoute(t, $rootScope, $location, '/panel-de-control', $state, 'dashboard');
  testUtils.checkRoute(t, $rootScope, $location, '/home', $state, 'dashboard');
  testUtils.checkRoute(t, $rootScope, $location, '/inicio', $state, 'dashboard');

  let routing = {state: {loggued: true}};
  t.equal($state.current.views.content.controllerProvider[1](routing), 'DashboardController', 'user loggued access to dashboard');

  routing.state.loggued = false;
  t.equal($state.current.views.content.controllerProvider[1](routing), 'LoginController', 'guess user access to login');

  t.end();

});

/*
$rootScope.$apply(function() {
  $location.path('/home');
});

expect($state.current.views.content.controller).to.equal('DashboardController');
expect($state.current.views.content.controllerAs).to.equal('dashboard');
*/
