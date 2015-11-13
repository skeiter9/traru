import angularAria from 'angular-aria/angular-aria.min.js';
import angularSanitize from 'angular-sanitize/angular-sanitize.min.js';
import angularAnimate from 'angular-animate/angular-animate.min.js';

import angularMessages from 'angular-messages/angular-messages.min';

import angularMaterial from 'angular-material/angular-material.min.js';

import angularTranslate from 'angular-translate';
import angularTranslateLoaderPartial from 'angular-translate-loader-partial';
import angularDynamicLocale from 'angular-dynamic-locale';

import capitalizeFilterAM from '../utils/capitalize.filter.js';
import formAM from '../utils/form.directive.js';

require('./styles/layout.css');

export default angular
  .module('layout', [

    'ngMessages',
    'ngMaterial',
    'ngSanitize',
    'pascalprecht.translate',

    'tmh.dynamicLocale',

    capitalizeFilterAM.name,
    formAM.name
  ])
  .config(['$translateProvider', 'tmhDynamicLocaleProvider',
  '$translatePartialLoaderProvider', '$provide',
  function($trP, tmhDLP, $tPLP, $p) {

    //$trP.useMissingTranslationHandlerLog();
    tmhDLP.localeLocationPattern('/i18n/angular-locale_{{locale}}.js');

    $trP
      .useSanitizeValueStrategy('sanitize')
      /*
      .fallbackLanguage('en')
      .registerAvailableLanguageKeys(['en', 'es'], {
        'en_*': 'en',
        'es_*': 'es'
      })
      .determinePreferredLanguage()
      */
      .useLoader('$translatePartialLoader', {
        urlTemplate: '/api/settings/i18n/{part}/{lang}'
      });

    $p.provider('appConfig', function() {

      let name = 'traru';

      this.setName = newName => name = newName;

      this.$get = [() => {
        return {
          name: name
        };
      }];
    });

  }])

  .run(['$translate', 'tmhDynamicLocale', '$window', ($tr, tmhD, $w) => {
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
  }])

  .service('layout', ['$state', '$mdSidenav', 'User', '$translate',
  '$translatePartialLoader', 'appConfig', 'Settings', '$q', '$log',
  'tmhDynamicLocale',
  function($st, $mdS, U, $tr, $tPL, appC, S, $q, $l, tmhD) {

    this.title = appC.name;
    this.sidenavRightToolbarTitle = '';
    this.sidenavRightToolbarIconLeft = 'close';
    this.stateName = '';
    this.loggued = false;
    this.loaded = [];
    this.initialized = false;

    this.refresh = () => $st.reload();
    this.isLoggued = () => U.isAuthenticated();

    this.toggleSidenav = (idS) => $mdS(idS).toggle();
    this.openSidenav = (idS) => $mdS(idS).open();
    this.closeSidenav = (idS) => $mdS(idS).close();
    this.logout = () => U.logout().$promise.then(() => {
      this.loggued = false;
      return $st.reload();
    });
    this.changeLanguage = lang => {
      $tr.use(lang);
      return $q.all([
        $tr.refresh(),
        tmhD.set(lang)
      ]);
    };

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

    this.loadState = (stateName) => {
      const isLoggued = this.isLoggued();
      stateName = stateName === 'dashboard' && !isLoggued ? 'login' : stateName;

      if (this.loaded.indexOf('layout') === -1) $tPL.addPart('layout');
      if (this.loaded.indexOf(stateName) === -1) $tPL.addPart(stateName);

      this.stateName = stateName;
      this.loggued = isLoggued;

      return $q.all([
        !this.initialized && !this.loggued ?
          S.findOne({filter: {where: {userId: 'public'}}}).$promise :
        !this.initialized && this.loggued ?
          S.findOne({filter: {where: {userId: U.getCurrentId}}}).$promise :
          $q.when()
      ])
        .then((s) => {
          if (angular.isUndefined(s)) return $q.when();
          this.preferredLanguage = $tr.preferredLanguage = s[0].preferredLanguage;
          this.langFallback = $tr.fallbackLanguage = s[0].langFallback;
          this.langsAvailables = s[0].langsAvailables;
          $tr.use(this.preferredLanguage);
          return $q.all([
            $tr.refresh(),
            tmhD.set(this.preferredLanguage)
          ]);
        })
        .catch((err) => {
          $l.error(err);
        });

    };

  }]);
