'use strict';

const test = require('tape');
const testUtils = require('../test-utils.js');

test('check google maps directives', (t) => {

  const injector = angular.injector(['appTest']);
  const $rootScope = injector.get('$rootScope');
  const $location = injector.get('$location');
  const $state = injector.get('$state');
  const gmap = injector.get('gmap');

  t.equal(gmap.defaultCoordinates).to.be.a('object');
  t.equal(gmap.defaultCoordinates).to.have.property('lat');
  t.equal(gmap.defaultCoordinates).to.have.property('lng');
  t.equal(gmap.defaultCoordinates.lat).to.be.a('number');
  t.equal(gmap.defaultCoordinates.lng).to.be.a('number');

  t.end();

});
