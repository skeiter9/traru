'use strict';

describe('Directive: trucks', function() {

  let $compile = null;
  let $mdSidenav = null;
  let layout = null;

  let scope = null;
  let truck = null;

  beforeEach(function() {
    module('app');
    inject(function(_$compile_, _$rootScope_, _layout_, _$mdSidenav_) {
      $compile = _$compile_;
      $mdSidenav = _$mdSidenav_;
      layout = _layout_;

      //$rootScope = _$rootScope_;
      scope = _$rootScope_.$new();
      truck = $compile(angular.element(`<trucks items='trucks' />`))(scope);
    });
  });

  it('trucks directive exists', () => {
    expect(truck.find('md-toolbar').find('span').text()).to.equal('trucks');
  });

  it('there is no trucks seted', () => {
    scope.$digest();
    expect(truck.find('md-list').length).to.equal(0);
    expect(truck[0].querySelectorAll('.md-subheader').length).to.equal(1);
  });

  it('there is no trucks registered', () => {
    scope.trucks = [];
    scope.$digest();

    expect(truck.find('md-list').length).to.equal(0);
    expect(truck[0].querySelectorAll('.md-subheader').length).to.equal(1);
  });

  it('list of trucks', () => {
    scope.trucks = [
      {licensePlate: 'MMER78', model: 'viod'},
      {licensePlate: 'POI980', model: 'loli'},
    ];
    scope.$digest();
    expect(truck.find('md-list-item').length).to.equal(2);
  });

  it('select truck', () => {

    setTimeout(() => {
      truck.find('md-list-item')[0].triggerHandler('mouseenter');
      expect($mdSidenav('right').isOpen(), 'sidenav right must be opened').to.be.true;
    }, 0);

  });

});

describe('Directive: truck', function() {

  let $compile = null;
  let $mdSidenav = null;
  let layout = null;

  let scope = null;
  let truck = null;

  beforeEach(function() {
    module('app');
    inject(function(_$compile_, _$rootScope_, _layout_, _$mdSidenav_) {
      $compile = _$compile_;
      $mdSidenav = _$mdSidenav_;
      layout = _layout_;

      //$rootScope = _$rootScope_;
      scope = _$rootScope_.$new();
      truck = $compile(angular.element(`<truck item='truck' />`))(scope);
    });
  });

  it('there is no truck seted', () => {
    scope.$digest();
    expect(truck.find('section').children().length).to.equal(0);
    expect(truck[0].querySelectorAll('.md-subheader').length).to.equal(1);
  });
  /*
  it('there is no trucks registered', () => {
    scope.trucks = [];
    scope.$digest();

    expect(truck.find('md-list').length).to.equal(0);
    expect(truck[0].querySelectorAll('.md-subheader').length).to.equal(1);
  });

  it('list of trucks', () => {
    scope.trucks = [
      {licensePlate: 'MMER78', model: 'viod'},
      {licensePlate: 'POI980', model: 'loli'},
    ];
    scope.$digest();
    expect(truck.find('md-list-item').length).to.equal(2);
  });

  it('select truck', () => {

    setTimeout(() => {
      truck.find('md-list-item')[0].triggerHandler('mouseenter');
      expect($mdSidenav('right').isOpen(), 'sidenav right must be opened').to.be.true;
    }, 0);

  });
  */
});
