import verge from 'verge';

export default angular
  .module('appUtilsVerge', [])
  .factory('yeVerge', [() => {
    //return require('verge');
    return verge;
  }]);
