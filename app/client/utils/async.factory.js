import async from 'async';

export default angular.module('asyncFactory', [])
  .factory('async', [() => async]);
