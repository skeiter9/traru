//import LayoutController from './layout.controller.js';

import angularAria from 'angular-aria/angular-aria.min.js';
import angularSanitize from 'angular-sanitize/angular-sanitize.min.js';
import angularAnimate from 'angular-animate/angular-animate.min.js';

import angularMessages from 'angular-messages/angular-messages.min';

//import angularResource from 'angular-resource';

import angularMaterial from 'angular-material/angular-material.min.js';

import angularTranslate from 'angular-translate';
import angularTranslateLoaderPartial from 'angular-translate-loader-partial';
import angularDynamicLocale from 'angular-dynamic-locale';

import capitalizeFilterAM from '../utils/capitalize.filter.js';
import formAM from '../utils/form.directive.js';

require('./styles/layout.css');

export default angular
  .module('layout', [

    //ngResource,
    'ngMessages',
    'ngMaterial',
    'ngSanitize',
    'pascalprecht.translate',

    'tmh.dynamicLocale',

    capitalizeFilterAM.name,
    formAM.name
  ])
  .config(['$translateProvider', 'tmhDynamicLocaleProvider',
  function($trP, tmhDLP) {

    //$trP.useSanitizeValueStrategy('sanitize');

    //$trP.useMissingTranslationHandlerLog();
    tmhDLP.localeLocationPattern('/i18n/ngLocale/angular-locale_{{locale}}.js');

    $trP
      .useSanitizeValueStrategy('sanitize');

    //.addInterpolation('$translateMessageFormatInterpolation')
    //.useLoader('$translatePartialLoader', {
    //  urlTemplate: '/i18n/{part}/{part}-{lang}.json'
    //});

  }])
  .run([() => {
    const throttle = (type, name, obj = window) => {
      //const obj = obj || window;
      let running = false;
      const func = () => {
        if (running) return;
        running = true;
        requestAnimationFrame(() => {
          obj.dispatchEvent(new CustomEvent(name));
          running = false;
        });
      };

      obj.addEventListener(type, func);
    };
    /* init - you can init any event */
    throttle('resize', 'optimizedResize');
  }])

  .controller('LayoutController', ['layout', '$state', function(layout, $st) {
    //console.log($st);
    this.ui = layout;
    this.title = 'traru';
  }])

  .factory('routing', ['$state', 'User', function($s, U) {

    let State = {
      loggued: false
    };

    return {
      state: Object.create(State),
      isLoggued() {
        return U.isAuthenticated();
      }
    };
  }])

  .service('layout', ['$state', '$mdSidenav', 'User', function($st, $mdS, U) {

    this.sidenavRightToolbarTitle = '';
    this.sidenavRightToolbarIconLeft = 'close';

    this.refresh = () => $st.reload();
    this.isLoggued = () => U.isAuthenticated();
    this.logout = () => U.logout().$promise.then(() => $st.reload());
    this.toggleSidenav = (idS) => $mdS(idS).toggle();
    this.openSidenav = (idS) => $mdS(idS).open();
    this.closeSidenav = (idS) => $mdS(idS).close();

    this.settings = () => {

      this.sidenavRightToolbarTitle = 'settings';
      this.sidenavRightToolbarIconLeft = 'close';
      this.sidenavRightToolbarIconLeftAction = (e) => {
        this.closeSidenav('right');
      };

      this.sidenavRightContent = {
        html: `<span> settings </span>`
      };

      return this.openSidenav('right');
    };

  }]);
