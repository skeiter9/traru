'use strict';

const test = require('tape');
const testUtils = require('../utils/test-utils.js');

const injector = angular.injector(['appTest']);
const $httpBackend = injector.get('$httpBackend');
const $rootScope = injector.get('$rootScope');
const $location = injector.get('$location');
const $state = injector.get('$state');

test('check layout routes', (t) => {

  $rootScope.$apply(() => $location.path('/this routes has spaces'));
  t.equal($state.params.failState, 'this-routes-has-spaces', 'formate url with spaces');

  $rootScope.$apply(() => $location.path('/thisRoutesHasUpperCases'));
  t.equal($state.params.failState, 'thisrouteshasuppercases', 'normalize url');

  t.end();

});
