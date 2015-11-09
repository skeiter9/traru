import LayoutController from './layout.controller.js';

import angularAria from 'angular-aria/angular-aria.min.js';
import angularSanitize from 'angular-sanitize/angular-sanitize.min.js';
import angularAnimate from 'angular-animate/angular-animate.min.js';

//import angularMessages from 'angular-messages';

//import angularResource from 'angular-resource';

import angularMaterial from 'angular-material/angular-material.min.js';

import angularTranslate from 'angular-translate';
import angularTranslateLoaderPartial from 'angular-translate-loader-partial';
import angularDynamicLocale from 'angular-dynamic-locale';

import capitalizeFilterAM from '../utils/capitalize.filter.js';

require('./styles/layout.css');

export default angular
  .module('layout', [

    //angularResource,
    //angularMessages,
    'ngMaterial',
    'ngSanitize',
    'pascalprecht.translate',

    'tmh.dynamicLocale',

    capitalizeFilterAM.name
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
  .controller('LayoutController', LayoutController)
  .service('layout', ['$state', '$mdSidenav', function($s, $mdS) {

    this.title = 'traru';

    this.refresh = () => $s.reload();
    this.toggleSidenav = (idS) => $mdS(idS).toggle();
    this.openSidenav = (idS) => $mdS(idS).open();
    this.closeSidenav = (idS) => $mdS(idS).close();

  }]);
