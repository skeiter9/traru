//require('./styles/dashboard.css');

//import dashboardControllerFn from './dashboard.controller.js';
import layoutAM from '../layout/layout.js';
import apiAM from '../api/api.js';
import validFormAM from '../utils/valid-form.factory.js';

module.exports = angular
  .module('appDashboard', [
    layoutAM.name,
    apiAM.name,
    validFormAM.name,
    'ngMaterial'
  ])

  .controller('LoginController', ['$state', function($st) {
  }])

  .directive('loginForm', ['$log', 'yeValidForm', 'User', '$mdToast', '$q',
  ($l, vForm, U, $mdT, $q) => {
    return {
      scope: {},
      bindToController: true,
      controllerAs: 'mForm',
      controller: angular.noop,
      template: require('./templates/login-form.jade')(),
      link(s, elem, attrs, mForm) {
        mForm.form = {};
        mForm.save = (form) => {
          return vForm(form)
          .then((result) => U.login(mForm.form).$promise)
          .then((user) => {
            $l.debug('user is loggued: ', user);
          })
          .catch((err) => {
            $l.debug(err);
            if (!!err.errorOne) $mdT.showSimple(err.errorOne.messageCode);
            else if (!!err.data && !!err.data.error && !!err.data.error.code
            ) $mdT.showSimple(err.data.error.code);
          });
        };
      }
    };
  }]);
