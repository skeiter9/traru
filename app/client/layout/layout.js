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
      .useSanitizeValueStrategy('escape')
      .useLoader('$translatePartialLoader', {
        urlTemplate: '/api/settings/i18n/{part}/{lang}'
      });

    $p.provider('appConfig', function() {

      let name = 'traru';

      this.setName = newName => name = newName;

      this.$get = [() => {
        return {
          name: name,
          apiUrl: 'api'
        };
      }];
    });

  }])

  .run(['$translate', 'tmhDynamicLocale', '$window', ($tr, tmhD, $w) => {
    const throttle = (type, name, obj = window) => {
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
  'tmhDynamicLocale', '$mdDialog', 'capitalizeFilter', '$mdToast',
  function($st, $mdS, U, $tr, $tPL, appC, S, $q, $l, tmhD, $mdD, capitalizeF,
  $mdT) {

    this.title = appC.name;
    this.sidenavRightToolbarTitle = '';
    this.sidenavRightToolbarTitleVars = {};
    this.sidenavRightToolbarIconLeft = 'close';
    this.stateName = '';
    this.loggued = false;
    this.loaded = [];
    this.initialized = false;

    this.refresh = () => $st.reload();
    this.isLoggued = () => U.isAuthenticated();

    this.toggleSidenav = idS => $mdS(idS).toggle();
    this.openSidenav = idS => $mdS(idS).open();
    this.closeSidenav = idS => $mdS(idS).close();
    this.logout = () => U.logout().$promise.then(() => {
      this.loggued = false;
      return $st.reload();
    });
    this.changeLanguage = lang => {
      $l.debug('change language to ' + lang);
      $tr.use(lang);
      return tmhD.set(lang);
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

    this.loadTranslatePart = section => $tPL.addPart(section);

    this.loadState = (stateName, fn) => {

      this.loggued = this.isLoggued();
      this.stateName = this.loggued && stateName === 'login' ?
        stateName : 'login';

      if (this.loaded.indexOf('layout') === -1) this
        .loadTranslatePart('layout');
      if (this.loaded.indexOf(this.stateName) === -1) this
        .loadTranslatePart(this.stateName);

      return $q.all([
        !this.initialized && !this.loggued ?
          S.findOne({filter: {where: {userId: 'public'}}}).$promise :
        !this.initialized && this.loggued ?
          S.findOne({filter: {where: {userId: U.getCurrentId}}}).$promise :
          $q.when(),
        !!fn ? fn() : $q.when()
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
          ])
          .then(() => {
            if (!!!s[1]) $l.debug('the fn from resolve not return a value');
            return s[1];
          });
        })
        .catch((err) => {
          $l.error(err);
        });

    };

    this.removeItem = ({evt, item, title, model}) => {
      return $tr([
        'DIALOG.DELETE_TITLE',
        'DIALOG.DELETE_CONTENT',
        'ACTIONS.CANCEL',
        'ACTIONS.DELETE',
        'ITEM.DELETED_MODULE',
        'ITEM.DELETED_MODULE_FAIL'
      ], {moduleItem: title || 'item'})
        .then((t) => {
          const confirm = $mdD.confirm()
            .title(t['DIALOG.DELETE_TITLE'].toUpperCase())
            .content(capitalizeF(t['DIALOG.DELETE_CONTENT']))
            .ok(t['ACTIONS.DELETE'])
            .cancel(t['ACTIONS.CANCEL'])
            .theme('default')
            .ariaLabel(`remove ${title}`)
            .targetEvent(evt);

          return $mdD.show(confirm).then(() => t);
        })
        .then((t) => model.deleteById({id: item.id}))
        .then((v) => $q.all([
          this.closeSidenav('right'),
          $mdT.showSimple($tr.instant('API.ITEM_DELETED',
            {moduleItem: title}))
        ]))
        .catch((err) => {
          if (!!err) $l.debug(err);
        });
    };
  }]);
