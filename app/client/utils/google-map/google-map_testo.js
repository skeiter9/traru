'use strict';

describe('Service: gmap', () => {

  let gmap = null;

  beforeEach(module('app'));

  beforeEach(inject(function(_gmap_) {
    gmap = _gmap_;
  }));

  it('check default coordinates', () => {
    expect(gmap.defaultCoordinates).to.be.a('object');
    expect(gmap.defaultCoordinates).to.have.property('lat');
    expect(gmap.defaultCoordinates).to.have.property('lng');
    expect(gmap.defaultCoordinates.lat).to.be.a('number');
    expect(gmap.defaultCoordinates.lng).to.be.a('number');
  });

});
