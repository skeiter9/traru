import verge from 'verge';

export default angular
  .module('appUtilsVerge', [])
  .factory('verge', [() => {
    return verge;
  }]);
