import LayoutController from './layout.controller.js';

import angularAria from 'angular-aria/angular-aria.min.js';
import angularSanitize from 'angular-sanitize/angular-sanitize.min.js';
import angularAnimate from 'angular-animate/angular-animate.min.js';

//import angularMessages from 'angular-messages';

//import angularResource from 'angular-resource';

import angularMaterial from 'angular-material/angular-material.min.js';

import angularTranslate from 'angular-translate';

import angularTranslateLoaderPartial from 'angular-translate-loader-partial';

//import angularDynamicLocale from 'angular-dynamic-locale';

import capitalizeFilterAM from '../utils/capitalize.filter.js';

require('./styles/layout.css');

//require('../node_modules/angular-material/angular-material.css');

export default angular
  .module('layout', [

    //angularResource,
    //angularMessages,
    'ngMaterial',
    'ngSanitize',
    'pascalprecht.translate',

    //'tmh.dynamicLocale',

    capitalizeFilterAM.name
  ])
  .config(['$translateProvider', function($trP) {

    $trP.useSanitizeValueStrategy('sanitize');

    //$trP.useMissingTranslationHandlerLog();

  }])
  .controller('LayoutController', LayoutController);
