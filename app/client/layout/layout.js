/**
 * layout module
 *
 */

import angularAria from 'angular-aria/angular-aria.min.js';
import angularSanitize from 'angular-sanitize/angular-sanitize.min.js';
import angularAnimate from 'angular-animate/angular-animate.min.js';

import angularMessages from 'angular-messages/angular-messages.min';

import angularMaterial from 'angular-material/angular-material.min.js';

import angularTranslate from 'angular-translate';
import angularTranslateLoaderPartial from 'angular-translate-loader-partial';
import angularDynamicLocale from 'angular-dynamic-locale';
import angularTM  from 'angular-translate-interpolation-messageformat';

import ngFx from 'ng-fx';

import capitalizeFilterAM from '../utils/capitalize.filter.js';
import formAM from '../utils/form.directive.js';

import asyncAM from '../utils/async.factory.js';

import {themes} from './themes.js';

require('./styles/layout.css');

export default angular.module('layout', [
    'ngMessages',
    'ngMaterial',
    'ngSanitize',
    'pascalprecht.translate',
    'tmh.dynamicLocale',
    angularTM,
    ngFx,
    capitalizeFilterAM.name,
    formAM.name,
    asyncAM.name
])
  .config(['$translateProvider', 'tmhDynamicLocaleProvider',
  '$translatePartialLoaderProvider', '$provide', '$mdThemingProvider',
  ($trP, tmhDLP, $tPLP, $p, $mdTP) => {

    themes($mdTP);

    tmhDLP.localeLocationPattern('/i18n/angular-locale_{{locale}}.js');

    $trP
      .addInterpolation('$translateMessageFormatInterpolation')
      .useSanitizeValueStrategy('escape')
      .useLoader('$translatePartialLoader', {
        urlTemplate: '/api/settings/i18n/{part}/{lang}'
      });

    $p.provider('appConfig', function() {

      let name = 'traru';
      let apiUrl = 'api';

      this.setName = newName => name = newName;
      this.setApiUrl = newApiUrl => apiUrl = newApiUrl;

      this.$get = [() => {
        return {
          name: name,
          apiUrl: apiUrl
        };
      }];
    });

  }])

	.run(['$translate', 'tmhDynamicLocale', '$window',
  ($tr, tmhD, $w) => {

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
  '$document', 'yeValidForm', 'validFormUtils',
  'Company', 'Truck', 'Route', 'Client', 'Worker',
  function($st, $mdS, U, $tr, $tPL, appC, S, $q, $l, tmhD, $mdD, capitalizeF,
  $mdT, async, $d, vForm, vFormU, C, T, R, Cl, W) {

    this.title = appC.name;
    this.sidenavRightToolbarTitle = '';
    this.sidenavRightToolbarTitleVars = {};
    this.sidenavRightToolbarIconLeft = 'close';
    this.stateName = '';
    this.loggued = false;
    this.loaded = [];

    this.refresh = () => $st.reload();

    this.isLoggued = () => U.isAuthenticated();

    this.logout = () => U.logout().$promise
      .then(() => this.closeSidenav('left'))
      .then(() => $st.reload());

    this.openSidenav = idS => $mdS(idS).open();

    this.closeSidenav = idS => $mdS(idS).close()
      .then(() => this.sidenavRightContentClass = '');

    this.changeLanguage = lang => {
      $l.debug('change language to ' + lang);
      $tr.use(lang);
      return tmhD.set(lang);
    };

    this.settings = () => {

      this.sidenavRightToolbarTitle = 'settings';
      this.sidenavRightToolbarIconLeft = 'close';
      this.sidenavRightToolbarIconLeftAction = () => this.closeSidenav('right');

      this.sidenavRightContent = {
        html: `<span> settings </span>`
      };

      return this.closeSidenav('left').then(() => this.openSidenav('right'));
    };

    this.loadTranslatePart = section => {
      if (this.loaded.indexOf('layout') === -1) $tPL.addPart(section);
    };

    const setDataUser = data => !!data && !!!data.roles ? data :
      !!data ? data : {};

    const setI18n = (s) => {
      this.preferredLanguage = $tr.preferredLanguage = s.preferredLanguage;
      this.langFallback = $tr.fallbackLanguage = s.langFallback;
      this.langsAvailables = s.langsAvailables;
    };

    const getCrud = (models, roles, isLoggued) => $q((resolve, reject) => {

      if (!isLoggued) return resolve({});

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
            else if (acl.model === model.name && acl.property === 'updateAttributes') cbInner(true);
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
            else if (acl.property === 'updateAttributes') cb(null, setAcl(conf, 'u', acl));
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
        this.loadTranslatePart(k);
        if (k === 'client') {
          this.loadTranslatePart('person');
          this.loadTranslatePart('company');
        }else if (k === 'worker') {
          this.loadTranslatePart('department');
          this.loadTranslatePart('cargo');
        }

        cb(null);
      },

      (err) => resolve());
    });

    this.userIsRoot = (dataUser) => $q((resolve, reject) => angular
      .isUndefined(dataUser) ||
      !angular.isObject(dataUser) ||
      !angular.isArray(dataUser.roles) ?
        reject(new Error('user data is wrong')) :
        async.detect(dataUser.roles,
          (item, cb) => cb(item.name === 'root'),
          (results) => angular.isDefined(results) ?
           resolve(true) : resolve(false)
					)
        );

    const checkInitCompany = (stateName) => C.find({
        filter: {where: {main: true}}
      }).$promise
      .then(cs => cs.length === 0 && stateName !== 'initCompany' ?
          $st.go('initCompany') :
        cs.length > 0 && stateName === 'initCompany' ?
         $st.go('dashboard') : true
      );

    const modulesToServe = (stateName, role) => {
      let res = [];
      if (stateName === 'dashboard') {
        if (role === 'root') res = [
          {name: 'truck', model: T},
          {name: 'company', model: Co},
          {name: 'route', model: R},
          {name: 'client', model: C},
          {name: 'worker', model: W}
        ];
        else if (role === 'client') res = [
          {name: 'route', model: R}
        ];
        else res = [];
      } else res = [];

      return res;

    };

    this.prepareUI = (dataUser, stateName) => this.userIsRoot(dataUser)
      .then(isRoot => isRoot ? checkInitCompany(stateName) : 'pass')
      .then(pass => modulesToServe(stateName));

    this.loadState = ({stateName, models, fn = () => $q.when()}) => {

      this.loggued = this.isLoggued();
      this.stateName = this.loggued && stateName !== 'login' ?  stateName :
        this.loggued && stateName === 'login' ? 'dashboard' : 'login';

      this.loadTranslatePart('layout');
      this.loadTranslatePart(this.stateName);

      return $q.all([
        this.loggued ?
          U.findById({id: U.getCurrentId(), filter: {include: [
            'settings',
            {roles: 'acls'}
          ]}}).$promise :
          S.findOne({filter: {where: {userId: 'public'}}}).$promise
      ])

        .then((res) => {
          this.dataUser = setDataUser(res[0]);
          setI18n(this.loggued ? res[0].settings : res[0]);
          return getCrud(models, this.dataUser.roles, this.loggued);
        })

        .then((res) => {
          if (this.loggued) this.dataUser.models = res;
          return $q.all([
            setI18nModules(res),
            $q.when(res)
          ]);
        })

				.then((res) => {
          $tr.use(this.preferredLanguage);
          return $q.all([
            $q.when(res[1]),
            $tr.refresh(),
            fn()
          ]).then(resI => resI[0]);
        })

        .catch((err) => {
          $l.error(err);
        });

    };

    this.sidenavRightAction = ({
      scope,
      title,
      tag = 'br',
      attrs = '',
      item,
      titleVars = {},
      className = '',
      theme = 'default'
    }) => {
      const s = scope.$new();
      s.item = item;
      this.sidenavRightToolbarTitle = title;
      this.sidenavRightToolbarTitleVars = titleVars;
      this.sidenavRightToolbarIconLeft = 'close';
      this.sidenavRightToolbarIconLeftAction = (e) => this
        .closeSidenav('right');

      this.sidenavRightContent = {
        html: `<${tag} ${attrs} item='item' in-sidenav/>`,
        scope: s
      };
      this.sidenavRightContentClass = className;
      this.sidenavRighTheme = theme;

      return this.openSidenav('right');
    };

    this.checkAvailables = (itemsToValid, items, propKey
    ) => $q((resolve, reject) => {
      async.filter(itemsToValid,
      (item, cb) => async.detect(items,
        (itemInner, cbInner) => cbInner(itemInner[propKey] === item.id),
        (resultsInner) => cb(!!!resultsInner ? true : false)),
      (results) => resolve(results));
    });

    const saveData = (Model, mForm, upsertItem = false, dataToSend = null
    ) => !!mForm.item ?
      Model[upsertItem ?  'upsertItem' : 'prototype$updateAttributes']({
        where: {id: mForm.item.id}},
        !!dataToSend ? dataToSend : mForm.form
      ).$promise :
      Model[upsertItem ?  'upsertItem' : 'create'](
        !!dataToSend ? dataToSend : mForm.form
      ).$promise;

    this.validModule = module => $q((resolve, reject) => angular
      .isDefined(module) &&
      angular.isObject(module) && angular.isObject(module.crud) &&
      angular.isObject(module.crud.r) &&
      module.crud.r.status ? resolve(module) : reject());

    this.saveItem = ({
      Model,
      form,
      mForm,
      modelName,
      dataToSend = null,
      onlyCheck = false,
      onlySend = false,
      upsertItem = false,
      showToast = true,
      propTitle,
      formSuccess
    }) => (() => onlySend ?
      saveData(Model, mForm, upsertItem, dataToSend) :
      vForm(form)
    )()

      .then(res => onlySend ?
          $q.when(res) :
        onlyCheck ?
          $q.when(mForm.form) :
          saveData(Model, mForm, upsertItem, dataToSend)
      )

      .then(res => $q.all([onlyCheck ? mForm.form : res,
        showToast && !onlyCheck ?
          $mdT.showSimple($tr.instant(
            angular.isString(propTitle) ? 'API.ITEM_ADD' : 'API.ITEM_ADD_ALONE',
            angular.isString(propTitle) ? {itemName: res[propTitle]} : {}
          )) :
          '',
        angular.isFunction(formSuccess) ? formSuccess() : ''
      ]))

      .then(res => onlyCheck ? mForm.form : res[0])

      .catch((err) => {
        $l.debug(err);
        return $q((resolve, reject) => {
          reject(vFormU.catchError({
            err: err,
            modelName: modelName,
            operation: onlyCheck ? `check form form ${modelName}` :
              mForm.item ? 'edit' : 'new'
          }));
        });
      });

    this.removeItem = ({evt, item, title, model, modelName}) => {
      if (!!!model) return $l.debug('pass a valid model resource');
      if (!angular.isObject(item)) return $l.debug('pass an item to delete');
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
          if (!!err) $l.debug(err);
          if (!!err && !!err.data && !!err.data.error &&
            !!err.data.error.code
          ) $mdT
            .showSimple($tr.instant(`API.${err.data.error.code}`, {
              operation: $tr.instant('ACTIONS.DELETE'),
              modelPlural: $tr
                .instant(`MODEL.${modelName.toUpperCase()}_PLURAL`)
            }));
        });
    };
  }]);
