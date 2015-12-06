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
import utilsAM from '../utils/utils.factory.js';
import {themes} from './themes.js';
import layoutRun from './layout.run.js';

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
    asyncAM.name//,
    //utilsAM.name
])

  .config(['$translateProvider', 'tmhDynamicLocaleProvider',
  '$translatePartialLoaderProvider', '$provide', '$mdThemingProvider',
  ($trP, tmhDLP, $tPLP, $p, $mdTP) => {

    themes($mdTP);

    tmhDLP.localeLocationPattern('/static/angular-locale_{{locale}}.js');

    $trP
      .addInterpolation('$translateMessageFormatInterpolation')
      .useSanitizeValueStrategy('escape')
      .useLoader('$translatePartialLoader', {
        urlTemplate: '/api/settings/i18n/{part}/{lang}'
      });

  }])

  .provider('appConfig', function() {

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
  })

	.run(layoutRun)

  .controller('LayoutController', ['layout', '$state', function(layout, $st) {
    this.ui = layout;
  }])

  .service('layout', ['utils', '$timeout', '$state', '$mdSidenav', 'User',
  '$translate',
  '$translatePartialLoader', 'appConfig', 'Settings', '$q', '$log',
  'tmhDynamicLocale', '$mdDialog', 'capitalizeFilter', '$mdToast', 'async',
  '$document', 'yeValidForm', 'validFormUtils',
  'Company', 'Truck', 'Route', 'Client', 'Worker', 'Department', 'Cargo',
  'Person',
  function(utils, $t, $st, $mdS, U, $tr, $tPL, appC, S, $q, $l, tmhD, $mdD,
  capitalizeF, $mdT, async, $d, vForm, vFormU, C, T, R, Cl, W, D, Ca, P) {

    this.title = appC.name;
    this.sidenavRightToolbarTitle = '';
    this.sidenavRightToolbarTitleVars = {};
    this.sidenavRightToolbarIconLeft = 'close';
    this.loggued = false;
    this.loaded = [];

    this.refresh = () => $st.reload();

    this.isLoggued = () => U.isAuthenticated();

    this.logout = () => U.logout().$promise
      .then(() => this.closeSidenav('left'))
      .then(() => {
        this.loggued = false;
        return $st.go('home');
      });

    this.go = (stateName) => $q.all([
      this.closeSidenav('left'),
      this.closeSidenav('right')
    ]).then(() => $st.go(stateName));

    this.openSidenav = idS => $mdS(idS).open();

    this.closeSidenav = idS => $mdS(idS).close()
      .then(() => this.sidenavRightContentClass = '');

    this.changeLanguage = lang => {
      $tr.use(lang);
      return $q.all([
        tmhD.set(lang),
        $tr.refresh()
      ]);
    };

    this.settings = () => {

      this.sidenavRightToolbarTitle = 'settings';
      this.sidenavRightToolbarIconLeft = 'close';
      this.sidenavRightToolbarIconLeftAction = () => this.closeSidenav('right');

      this.sidenavRightContent = {
        html: `<span> settings </span>`
      };

      return this.closeSidenav('left')
        .then(() => $st.go('settings'));
    };

    this.loadTranslatePart = section => {
      if (this.loaded.indexOf(section) === -1) {
        $tPL.addPart(section);
        if (section === 'initCompany') $tPL.addPart('company');
      }
    };

    const getModel = (modelName) => {
      let Model = null;
      if (modelName === 'truck') Model = T;
      else if (modelName === 'route') Model = R;
      else if (modelName === 'company') Model = C;
      else if (modelName === 'client') Model = Cl;
      else if (modelName === 'worker') Model = W;
      else if (modelName === 'department') Model = D;
      else if (modelName === 'cargo') Model = Ca;
      else if (modelName === 'person') Model = P;
      else if (modelName === 'settings') Model = S;
      return Model;
    };

    const getCrud = (roles = [], isLoggued) => $q((resolve, reject) => {

      if (!isLoggued) return resolve({});

      let modules = {};

      async.each(roles,
        (role, cb) => async.each(role.acls,
          (acl, cbInner) => {
            if (!!!modules[acl.model]) modules[acl.model] = {
              name: acl.model,
              model: getModel(acl.model),
              crud: {
                c: {status: false, roles: [], acls: []},
                r: {status: false, roles: [], acls: []},
                u: {status: false, roles: [], acls: []},
                d: {status: false, roles: [], acls: []}
              }
            };

            const action = acl.property === 'find' ? 'r' :
              acl.property === 'deleteById' ? 'd' :
              acl.property === 'create' ? 'c' :
              acl.property === 'updateAttributes' ? 'u' :
              'x';

            modules[acl.model].crud[action].status = true;
            modules[acl.model].crud[action].roles.push(role);
            modules[acl.model].crud[action].acls.push(acl);

            cbInner();
          },

          (err) => cb(null)
        ),
        (err) => resolve(modules)
      );

    });

    const setI18nModules = models => $q((resolve, reject) => async
    .forEachOf(models,
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

      (err) => resolve()
    ));

    const userIsRoot = (dataUser) => $q((resolve, reject) => angular
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

    this.checkInitCompany = (dataUser, toState) => userIsRoot(dataUser)

      .catch(() => 'noLoggued')

      .then(isRoot => !!isRoot && isRoot !== 'noLoggued' ?
        C.find({ filter: {where: {main: true}} }).$promise :
        isRoot === 'noLoggued' ? 'noLoggued'  : 'noRoot'
      )

      .catch((err) => {
        console.log(err);
        return 'noFetchCompanyMain';
      })

      .then(cs => {
        if (angular.isString(cs)) {
          return cs === 'noLoggued' ? toState.auth ? 'login' : toState.name :
            toState.name !== 'login' ? toState.name : 'dashboard';
        }else if (angular.isArray(cs)) {
          return cs.length === 0 && toState.name !== 'initCompany' ?
            'initCompany' :
            cs.length > 0 && toState.name === 'initCompany' ? 'dashboard' :
              toState.name;
        }else return 'home';

      });

    const setDataUser = dat => !!dat && !!!dat.roles ? dat : !!dat ? dat : {};

    const setI18n = (toStateName) => {

      const s = angular.extend({}, this.isLoggued() ?
        this.dataUser.settings : this.dataUser
      );

      if (!this.isLoggued()) s.preferredLanguage = utils
        .getLanguage(s.langsAvailables, s.preferredLanguage);

      this.preferredLanguage = s.preferredLanguage;
      this.langFallback = s.langFallback;
      this.langsAvailables = s.langsAvailables;
      $tr.fallbackLanguage(s.langFallback);
      $tr.preferredLanguage(s.preferredLanguage);
      $tr.use(s.preferredLanguage);

      return tmhD.set(s.preferredLanguage);

    };

    this.refreshLanguages = (toStateName) => {
      this.loadTranslatePart('layout');
      this.loadTranslatePart(toStateName);
      return $tr.refresh();
    };

    this.finishStateTransition = (toStateName) => {
      const fn = () => this.refreshLanguages(toStateName)
        .then(() => this.loadStateInProgress = false);
      if (this.isLoggued()) fn();
      else {
        const t1 = $t(() => {
          fn();
          $t.cancel(t1);
        }, 0);
      }
    };

    this.loadStateEnd = (toState) => setI18n(toState.name).then(() => toState);

    this.getDataUser = () => (this.isLoggued() ?
      U.findById({id: U.getCurrentId(),
        filter: {include: ['settings', {roles: 'acls'}]}}).$promise :
      S.findOne({filter: {where: {userId: 'public'}}}).$promise
    )

      .then(res => this.isLoggued() ?
        getCrud(res.roles, this.isLoggued())
          .then(modules => {
            res.modules = modules;
            return res;
          }) :
        setDataUser(res)
      )

      .catch(err => setDataUser({err: 'FAIL_FETCH_DATAUSER'}))

      .then(dataUser => {
        this.dataUser = dataUser;
        this.loggued = this.isLoggued() ? true : false;
        return dataUser;
      });

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
      this.sidenavRightToolbarIconLeftAction = e => this .closeSidenav('right');

      this.sidenavRightContentClass = className;
      this.sidenavRighTheme = theme;

      this.sidenavRightContent = {
        html: `<${tag} ${attrs} item='item' in-sidenav/>`,
        scope: s
      };

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

    this.isFormUpdate = (mForm) => angular.isObject(mForm.item) &&
      angular.isString(mForm.item.id);

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

      .then(res => onlyCheck ? !!mForm ? mForm.form : true : res[0])

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
