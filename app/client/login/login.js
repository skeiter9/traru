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

  .controller('LoginController', ['layout', function(l) {
  }])

  .directive('loginForm', ['layout', '$log', 'yeValidForm', 'User', '$mdToast',
  '$q', '$state', '$translate', 'validFormUtils',
  (l, $l, vForm, U, $mdT, $q, $st, $tr, vFormU) => ({
    scope: {},
    bindToController: true,
    controllerAs: 'mForm',
    controller: angular.noop,
    template: require('./templates/login-form.jade')(),
    link(s, elem, attrs, mForm) {
      mForm.form = {};
      mForm.save = (form) => {
        return vForm(form)
        .then(result => U.login(mForm.form).$promise)
        .then(user => l.getDataUser({fromForm: true}))
        .then(() => {
          $st.go(attrs.toState || 'dashboard');
          return;
        })
        .catch((err) => {
          $l.debug(err);
          vFormU.catchError({err: err});
        });
      };
    }
  })]);
