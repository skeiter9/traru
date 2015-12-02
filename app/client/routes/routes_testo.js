'use strict';

describe('main routes', function() {

  let $location = null;
  let $state = null;
  let $rootScope = null;

  beforeEach(() => {
    module('app');
    inject(function(_$location_, _$state_, _$rootScope_) {
      $location = _$location_;
      $state = _$state_;
      $rootScope = _$rootScope_;
    });
  });

  beforeEach(function() {
    $rootScope.$apply(function() {
      $location.path('/');
    });
  });

  it('abstract layout route setup', function() {
    expect($state.current.parent).to.equal('layout');
  });

  it('404 error for unknown route', function() {
    $rootScope.$apply(function() {
      $location.path('/qwerrtyuui');
    });

    expect($state.current.name).to.equal('e404');
  });

  it('main route should be dashboard', function() {
    expect($state.current.name).to.equal('dashboard');
  });

  it('login route', function() {

    $rootScope.$apply(function() {
      $location.path('/login');
    });

    expect($state.current.name).to.equal('login');
  });

});

describe('check i18n translations', () => {

  let $httpBackend = null;

  beforeEach(inject(function(_$httpBackend_) {
    $httpBackend = _$httpBackend_;
  }));

});
