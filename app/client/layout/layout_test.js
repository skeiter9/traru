'use strict';

describe('check layout data for ui', function() {

  let layout = null;

  beforeEach(module('app'));

  beforeEach(inject(function(_layout_) {
    layout = _layout_;
  }));

  it('layout service must have a title', function() {
    expect(layout).to.have.property('title');
    expect(layout.title).to.be.a('string');
  });

});
