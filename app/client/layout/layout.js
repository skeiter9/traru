import angularAria from 'angular-aria/angular-aria.min.js';
import angularSanitize from 'angular-sanitize/angular-sanitize.min.js';
import angularAnimate from 'angular-animate/angular-animate.min.js';
import angularMessages from 'angular-messages/angular-messages.min.js';
import angularCookies from 'angular-cookies/angular-cookies.min';
import angularMaterial from 'angular-material/angular-material.min.js';
import angularTranslate from 'angular-translate';
import angularTranslateLoaderPartial from 'angular-translate-loader-partial';
import angularTranslateStorageLocal from 'angular-translate-storage-local';
import angularTranslateStorageCookie from 'angular-translate-storage-cookie';
import angularDynamicLocale from 'angular-dynamic-locale';
import angularTM  from 'angular-translate-interpolation-messageformat';
import ngFx from 'ng-fx';
import capitalizeFilterAM from '../utils/capitalize.filter.js';
import formAM from '../utils/form.directive.js';
import asyncAM from '../utils/async.factory.js';
import utilsAM from '../utils/utils.factory.js';
import {themes} from './themes.js';
import layoutRun from './layout.run.js';

require('./styles/help.css')
require('./styles/layout.css');

export default angular.module('layout', [
    'ngMessages',
    'ngMaterial',
    'ngSanitize',
    'pascalprecht.translate',
    'tmh.dynamicLocale',
    'ngCookies',
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
    var pallete1 = $mdTP.extendPalette('yellow', {
      '500': '#F7D358',
      'contrastDefaultColor': 'dark'
    });
    var pallete2 = $mdTP.extendPalette('blue', {
      '500': '#2E64FE',
      'contrastDefaultColor': 'light'
    });

    $mdTP.definePalette('yellow2', pallete1);
    $mdTP.definePalette('blue2', pallete2);

    themes($mdTP);

    tmhDLP.localeLocationPattern('/static/angular-locale_{{locale}}.js');

    $trP
      .useLocalStorage()
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

    this.$get = [() => ({
      name: name,
      apiUrl: apiUrl
    })];
  })

	.run(layoutRun)

  .controller('LayoutController', ['layout', '$state', function(layout, $st) {
    this.ui = layout;
  }])

  .service('layout', ['utils', '$timeout', '$state', '$mdSidenav', 'User',
  '$translate', '$rootScope',
  '$translatePartialLoader', 'appConfig', 'Settings', '$q', '$log',
  'tmhDynamicLocale', '$mdDialog', 'capitalizeFilter', '$mdToast', 'async',
  '$document', 'yeValidForm', 'validFormUtils',
  'Company', 'Truck', 'Route', 'Client', 'Worker', 'Department', 'Cargo',
  'Person', 'LoopBackAuth',
  function(utils, $t, $st, $mdS, U, $tr, $rS, $tPL, appC, S, $q, $l, tmhD, $mdD,
  capitalizeF, $mdT, async, $d, vForm, vFormU, C, T, R, Cl, W, D, Ca, P, LoopBackAuth) {

    this.leftSidenavLocked = window.innerWidth >= 960;
    this.title = appC.name;
    this.sidenavRightToolbarTitle = '';
    this.sidenavRightToolbarTitleVars = {};
    this.sidenavRightToolbarIconLeft = 'close';
    this.sidenavRightToolbarIconLeftAction = e => this .closeSidenav('right')
      .then(() => $st.current.name.indexOf('.') !== -1 ?  $st.go('^') : '');
    this.loggued = false;
    this.loaded = [];

    this.refresh = () => {
      this.statusLoadState = 0;
      return $st.reload();
    }

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

    this.changeLanguage = lang => $tr.refresh()
      .then(() => $q.all([
        tmhD.set(lang),
        $tr.use(lang)
      ]));

    this.settings = () => {

      this.sidenavRightToolbarTitle = 'settings';
      this.sidenavRightToolbarIconLeft = 'close';
      this.sidenavRightToolbarIconLeftAction = () => this.closeSidenav('right');

      return this.closeSidenav('left').then(() => $st.go('settings'));
    };

    const loadTranslatePart = part => {
      if (!angular.isString(part)) return;
      else if (this.loaded.indexOf(part) !== -1) return part;
      $tPL.addPart(part);
      if (part === 'dashboard') for (let i = 0;
        i < this.dataUser.modules; i++) {
        if (angular.isString(this.dataUser.modules[i])) $tPL
          .addPart(this.dataUser.modules[i]);
      }

      return part;
    };

    this.loadTranslatePart = (part) => angular.isString(part) ?
      $q.when(loadTranslatePart(part)) :
      angular.isArray(part) ? $q((r, r2) => async
        .each(part, (p, cb) => cb(null, loadTranslatePart(p)), e => r(part))) :
      $q((r, r2) => {
        $l.debug('only strings or array for i18n parts(err_201)');
        r('only strings or array for i18n parts');
      });

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

    this.checkInitCompany = (dataUser) => userIsRoot(dataUser)
      .catch(() => 'noLoggued')
      .then(isRoot => !!isRoot && isRoot !== 'noLoggued' ?
        C.find({ filter: {where: {main: true}} }).$promise :
        isRoot === 'noLoggued' ? 'noLoggued'  : 'noRoot'
      )
      .catch((err) => {
        console.log(err);
        return {status: false, detail: 'noFetchCompanyMain'};
      })
      .then(res => {
        if (angular.isString(res)) return {status: false, detail: res};
        else if (angular.isArray(res) && res.length === 0) return {status: true};
        else if (angular.isArray(res) && res.length > 0) return {status: false};
        else return {status: false};
      });

    const setDataUser = dat => !!dat && !!!dat.roles ? dat : !!dat ? dat : {};

    const setI18n = (dataUser) => {

      const s = this.isLoggued() ? dataUser.settings : dataUser;

      if (!this.isLoggued()) s.preferredLanguage = utils
        .getLanguage(s.langsAvailables, s.preferredLanguage);

      this.preferredLanguage = s.preferredLanguage;
      this.langFallback = s.langFallback;
      this.langsAvailables = s.langsAvailables;

      $tr.preferredLanguage(s.preferredLanguage);
      $tr.fallbackLanguage(s.langFallback);

      this.loadTranslatePart('layout');

      return $tr.refresh()
        .then(() => $q.all([
          $tr.use(s.preferredLanguage),
          tmhD.set(s.preferredLanguage)
        ]))
        .then(() => dataUser);

    };

    const getDataUser = () => (
      //$rS.ininitialize ? $q.when(this.dataUser) :
      this.isLoggued() ?
        U.findById({id: U.getCurrentId(),
          filter: {include: ['settings', {roles: 'acls'}]}}).$promise :
        S.findOne({filter: {where: {userId: '0'}}}).$promise
    )
      .then(res => this.isLoggued() ?
        getCrud(res.roles, this.isLoggued())
          .then(modules => {
            res.modules = modules;
            console.log(modules)
            let menu = [];
            angular.forEach(modules, (m, i) => {
              menu.push(m);
            })
            this.menu = menu
            return res;
          }) :
        setDataUser(res)
      )

      .catch(err => {
        console.log(err);
        if (!!err && err.status === 401 ) {
          LoopBackAuth.clearUser();
          LoopBackAuth.clearStorage();
          /*
          return S.findOne({filter: {where: {userId: '0'}}}).$promise
            .then((res) => {
              console.log('HEYYYYYYY');
              return setDataUser(res)
            })
          */
        }
      });

    this.setI18nInitial = (dataU) => $rS.initialize?
        $q.when(dataU) : setI18n(dataU);

    const loadStateStart = () => $q((resolve, reject) => {
      if (this.statusLoadState !== 0) {
        this.loadStateInProgress = true;
        this.statusLoadState = 1;
        return resolve();
      } else return reject();
    });

    this.setDataUser = () => getDataUser()
      .then(dataUser => this.setI18nInitial(dataUser))
      .then(dataUser => {
        this.dataUser = dataUser;
        this.loggued = this.isLoggued() ? true : false;
        return dataUser;
      });

    this.resolveState = (toStateName, i18Parts = []) => loadStateStart()
      .then(() => getDataUser())
      .then(dataUser => this.setI18nInitial(dataUser))
      .then(dataUser => {
        this.dataUser = dataUser;
        this.loggued = this.isLoggued() ? true : false;
        return dataUser;
      })
      .then(dataUser => this.checkInitCompany(dataUser))
      .then(initC => {
        const toState = $st.get(toStateName);
        this.bootState = angular.isDefined(this.bootState) ? this.bootState : true;
        let stateRedirect = '';
        // if (initC.status) stateRedirect = 'initCompany';
        if (initC.status) stateRedirect = 'dashboard';
        else if (toStateName === 'home') stateRedirect = '';
        else if (
          (!initC.status && toState.name === 'initCompany' && this.loggued) ||
          (this.loggued && toState.name === 'login')
        ) stateRedirect = 'dashboard';
        else if (
          (!initC.status && !this.loggued) ||
          (!this.loggued && !!toState.auth)
        ) stateRedirect = 'login';
        if (stateRedirect === '') return {name: toState.name}
        return {name: stateRedirect, redirect: true};
      })
      .then((toState) => {
        console.log(toState)
        this.loadTranslatePart(toState.name);
        this.loadTranslatePart(i18Parts);
        this.statusLoadState = 0;
        if (toState.name === 'login' && toState.redirect) {
          //console.log('redirect', toState.name, i18Parts);
          //this.loadTranslatePart(toState.name);
          //this.loadTranslatePart(i18Parts);
          //this.statusLoadState = 0;
          //this.loadStateEnd()
          //return $q((resolve, r) => r(toState.name));
        }
        return $q.resolve();
      })

    this.loadStateEnd = (toState, i18Parts) => $tr.refresh()
      .then(() => {
        this.loadStateInProgress = false;
        this.statusLoadState = 1;
        if (!!!$rS.initialize) $rS.initialize = true;
      });

    this.sidenavRightAction = ({item, toStateName, toStateParams = {}}
    ) => {
      console.log('Go to: ', toStateName, toStateParams)
      return !!toStateName ?
        $st.go(toStateName, toStateParams) :
        this.openSidenav('right');
    }

    this.crudRoutes = ({moduleName, vm}) => {
      vm.showItem = (e, item) => this.sidenavRightAction({
        toStateName: `.${moduleName}Show`,
        toStateParams: {id: item.id}
      });

      vm.formItem = (e, item = null, extraData = {}) => {
        var mergeData = angular.extend({}, (!!item ? {id: item.id} : {}), extraData)
        return this.sidenavRightAction({
          toStateName: `.${moduleName}${!!item ? 'Update' : 'Create'}`,
          toStateParams: mergeData
        });
      }

      vm.deleteItem = (e, item) => this.sidenavRightAction({
        toStateName: `.${moduleName}Delete`,
        toStateParams: {id: item.id}
      });

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

    this.removeItem = ({evt, item, title, model, modelName,
      formSuccess = () => {}, formError = () => {}
    }) => {
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
        .catch(() => $q((r, r2) => $q.when(formError()).then(a => r2())))
        .then(t => model.deleteById({id: item.id}).$promise)
        .then(v => $q.all([
          $mdT.showSimple($tr.instant('API.ITEM_DELETED', {moduleItem: title})),
          formSuccess()
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
