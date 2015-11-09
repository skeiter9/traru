'use strict';

describe('Person', function() {

  let Person = null;

  beforeEach(module('app'));

  beforeEach(inject(function(_Person_) {
    Person = _Person_;
  }));

});
