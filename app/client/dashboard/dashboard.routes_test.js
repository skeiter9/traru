'use strict';

describe('dashboard routes', function() {

  let $state = null;
  let $location = null;
  let $rootScope = null;

  beforeEach(module('app'));
  beforeEach(inject(function(_$state_, _$location_, _$rootScope_) {
    $state = _$state_;
    $location = _$location_;
    $rootScope = _$rootScope_;
  }));

  it('alias for dashboard routes', function() {
    $rootScope.$apply(function() {
      $location.path('/panel-de-control');
    });

    expect($state.current.name).to.equal('dashboard');

    $rootScope.$apply(function() {
      $location.path('/panel');
    });

    expect($state.current.name).to.equal('dashboard');

    $rootScope.$apply(function() {
      $location.path('/home');
    });

    expect($state.current.name).to.equal('dashboard');

  });

  it('controller dasboard', function() {
    $rootScope.$apply(function() {
      $location.path('/home');
    });

    expect($state.current.views.content.controller).to.equal('DashboardController');
    expect($state.current.views.content.controllerAs).to.equal('dashboard');
  });

});
