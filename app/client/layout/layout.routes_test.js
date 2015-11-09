'use strict';

describe('layout routes', function() {

  let $state = null;
  let $location = null;
  let $rootScope = null;

  beforeEach(module('app'));
  beforeEach(inject(function(_$state_, _$location_, _$rootScope_) {
    $state = _$state_;
    $location = _$location_;
    $rootScope = _$rootScope_;
  }));

  it('formate urls', function() {

    $rootScope.$apply(function() {
      $location.path('/this routes has spaces');
    });

    expect($state.params.failState).to.equal('this-routes-has-spaces');

  });

  it('normalize urls', function() {

    $rootScope.$apply(function() {
      $location.path('/thisRoutesHasUpperCases');
    });

    expect($state.params.failState).to.equal('thisrouteshasuppercases');

  });

});
