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
import asyncAM from '../utils/async.factory.js';

require('./styles/layout.css');

export default angular
  .module('layout', [

    'ngMessages',
    'ngMaterial',
    'ngSanitize',
    'pascalprecht.translate',

    'tmh.dynamicLocale',

    capitalizeFilterAM.name,
    formAM.name,
    asyncAM.name
  ])
  .config(['$translateProvider', 'tmhDynamicLocaleProvider',
  '$translatePartialLoaderProvider', '$provide',
  function($trP, tmhDLP, $tPLP, $p) {

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
    this.ui = layout;
  }])

  .service('layout', ['$state', '$mdSidenav', 'User', '$translate',
  '$translatePartialLoader', 'appConfig', 'Settings', '$q', '$log',
  'tmhDynamicLocale', '$mdDialog', 'capitalizeFilter', '$mdToast', 'async',
  function($st, $mdS, U, $tr, $tPL, appC, S, $q, $l, tmhD, $mdD, capitalizeF,
  $mdT, async) {

    this.title = appC.name;
    this.sidenavRightToolbarTitle = '';
    this.sidenavRightToolbarTitleVars = {};
    this.sidenavRightToolbarIconLeft = 'close';
    this.stateName = '';
    this.loggued = false;
    this.loaded = [];

    this.refresh = () => {
      //localStorage.removeItem('traruSettings');
      return $st.reload();
    };

    this.isLoggued = () => U.isAuthenticated();

    this.toggleSidenav = idS => $mdS(idS).toggle();
    this.openSidenav = idS => $mdS(idS).open();
    this.closeSidenav = idS => $mdS(idS).close();
    this.logout = () => U.logout().$promise.then(() => {
      //localStorage.removeItem('traruSettings');
      return this.closeSidenav('left').then(() => $st.reload());
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

      return this.closeSidenav('left').then(() => this.openSidenav('right'));
    };

    this.loadTranslatePart = section => $tPL.addPart(section);

    const setDataUser = (data) => {
      if (!!data && !!!data.roles) return {};
      return data;
    };

    const setI18n = (s) => {
      this.preferredLanguage = $tr.preferredLanguage = s.preferredLanguage;
      this.langFallback = $tr.fallbackLanguage = s.langFallback;
      this.langsAvailables = s.langsAvailables;
    };

    const getCrud = (models, roles) => $q((resolve, reject) => {

      const setAcl = (conf, operation, acl) => {
        conf.crud[operation].status = true;
        conf.crud[operation].roles.push(acl.roleId);
        conf.crud[operation].acls.push(acl.id);
        return conf;
      };

      async.concat(models,
      (model, cbOut) => {

        async.concat(roles,
        (role, cb) => {
          async.filter(role.acls,
          (acl, cbInner) => {
            if (acl.model === model.name && acl.property === 'find') cbInner(true);
            else if (acl.model === model.name && acl.property === 'deleteById') cbInner(true);
            else if (acl.model === model.name && acl.property === 'create') cbInner(true);
            else if (acl.model === model.name && acl.property === 'prototype_updateAttributes') cbInner(true);
            else cbInner(false);
          },

          (results) => {
            cb(null, results);
          });
        },

        (err, results) => {
          async.reduce(results, {name: model.name, model: model.model, crud: {
            c: {status: false, roles: [], acls: []},
            r: {status: false, roles: [], acls: []},
            u: {status: false, roles: [], acls: []},
            d: {status: false, roles: [], acls: []}
          }},

          (conf, acl, cb) => {
            if (acl.property === 'create') cb(null, setAcl(conf, 'c', acl));
            else if (acl.property === 'find') cb(null, setAcl(conf, 'r', acl));
            else if (acl.property === 'prototype_updateAttributes') cb(null, setAcl(conf, 'u', acl));
            else if (acl.property === 'deleteById') cb(null, setAcl(conf, 'd', acl));
            else cb(null, conf);
          },

          (err, resultConf) => {
            cbOut(null, resultConf);
          });
        });

      },

      (err, results) => {
        let resModels = {};
        async.each(results,
        (item, cb) => {
          resModels[item.name] = item;
          cb(null);
        },

        (err) => {
          resolve(resModels);
        });
      });

    });

    const setI18nModules = models => $q((resolve, reject) => {
      async.forEachOf(models,
      (v, k, cb) => {
        $tPL.addPart(k);
        cb(null);
      },

      (err) => {
        resolve();
      });
    });

    this.loadState = ({stateName, models, fn}) => {

      this.loggued = this.isLoggued();
      this.stateName = this.loggued && stateName !== 'login' ?
        stateName : this.loggued && stateName === 'login' ?
          'dashboard' : 'login';

      if (this.loaded.indexOf('layout') === -1
      ) this.loadTranslatePart('layout');
      if (this.loaded.indexOf(this.stateName) === -1
      ) this.loadTranslatePart(this.stateName);

      return $q.all([
        this.loggued ?
          U.findById({id: U.getCurrentId(), filter: {include: [
            'settings',
            {roles: 'acls'}
          ]}}).$promise :
          S.findOne({filter: {where: {userId: 'public'}}}).$promise
      ])
        .then((res) => {
          //if (!!!localStorage.getItem('traruSettings')
          //) localStorage.setItem('traruSettings', JSON.stringify(res[0]));
          this.dataUser = setDataUser(res[0]);
          setI18n(this.loggued ? res[0].settings : res[0]);
          return getCrud(models, this.dataUser.roles);
        })
        .then((res) => {
          this.dataUser.models = res;
          return $q.all([
            setI18nModules(res),
            $q.when(res)
          ]);
        })
        .then((res) => {
          $tr.use(this.preferredLanguage);
          return $q.all([
            $tr.refresh(),
            tmhD.set(this.preferredLanguage),
            $q.when(res[1])
          ]);
        })
        .then((res) => {
          if (!!!res[2]) $l.debug('the fn from resolve not return a value');
          return res[2];
        })
        .catch((err) => {
          $l.error(err);
        });

    };

    this.sideavRightAction = ({scope, title, tag, item, titleVars = {}}) => {
      const s = scope.$new();
      s.item = item;
      this.sidenavRightToolbarTitle = title;
      this.sidenavRightToolbarTitleVars = titleVars;
      this.sidenavRightToolbarIconLeft = 'close';
      this.sidenavRightToolbarIconLeftAction = (e) => l.closeSidenav('right');

      this.sidenavRightContent = {
        html: `<${tag} item='item' />`,
        scope: s
      };

      return this.openSidenav('right');
    };

    this.removeItem = ({evt, item, title, model, modelName}) => {
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
        .then((t) => model.deleteById({id: item.id}).$promise)
        .then((v) => $q.all([
          this.closeSidenav('right'),
          $mdT.showSimple($tr.instant('API.ITEM_DELETED',
            {moduleItem: title}))
        ]))
        .catch((err) => {
          //if (!!err) $l.debug(err);
          if (!!err.data && !!err.data.error && !!err.data.error.code) $mdT
            .showSimple($tr.instant(`API.${err.data.error.code}`, {
              operation: $tr.instant('ACTIONS.DELETE'),
              modelPlural: $tr
                .instant(`MODEL.${modelName.toUpperCase()}_PLURAL`)
            }));
        });
    };
  }]);
