const moduleName = 'client';
const modelName = moduleName.slice(0, 1).toUpperCase() +
  moduleName.slice(1).toLowerCase();

import utilsDirectives from '../utils/utils-directive/utils.directive.js';
import personAm from '../person/person.js';
import companyAm from '../company/company.js';

export default angular.module(`traru${modelName}`, [
  utilsDirectives.name,
  personAm.name,
  companyAm.name
])

  .directive(`${moduleName}List`, ['layout', modelName, '$translate', '$log',
  '$timeout',
  (l, M, $tr, $l, $t) => ({
    restrict: 'E',
    scope: {
      model: '='
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'module',
    template: require(`./templates/${moduleName}-list.jade`)(),
    link(s, elem, attrs, module) {
      const vm = module; //-- tmp
      if (angular.isDefined(module.model) &&
        angular.isObject(module.model) && module.model.crud.r.status
      ) {
        module.model.model.find({
          filter: {include: ['person', 'company']}
        }).$promise
        .then((items) => {
          module.items = items;
          module.initialize = true;
        })
        .catch((err) => {
          $l.debug(err);
          module.initialize = true;
        });
      }else module.initialize = true;

      module.showItem = (e, item) => l.sidenavRightAction({
        scope: s,
        title: !!item.person ? item.person.firstName : item.company.socialName,
        tag: !!item.person ? 'person-show' : 'company-show',
        item: !!item.person ? item.person : item.company,
        theme: moduleName
      });

      vm.formItem = (e, item) => l.sidenavRightAction({
        scope: s,
        title: !!item ? 'SENTENCES.EDIT'  : 'SENTENCES.NEW',
        titleVars: {
          moduleName: $tr.instant('MODEL.' + modelName.toUpperCase()),
          item: !!item ?
            !!item.person ? item.person.firstName : item.company.socialName :
            ''
        },
        tag: `${moduleName}-form`,
        item: item,
        attrs: `
          in-company
          form-success='vm.formSuccess()'
        `,
        theme: moduleName
      });

      vm.deleteItem = (e, item) => l.removeItem({
        evt: e,
        model: M,
        item: item,
        title: !!item.person ? item.person.firstName : item.company.socialName,
        modelName: modelName
      });

    }

  })])

  .directive(`${moduleName}Form`, ['layout', '$log', 'yeValidForm', 'Client',
  '$mdToast', '$translate', 'validFormUtils', '$q', 'Person', 'Company',
  'async',
  (l, $l, vForm, M, $mdT, $tr, vFormU, $q, P, C, async) => ({
    restrict: 'E',
    scope: {
      item: '='
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'mForm',
    template: require(`./templates/${moduleName}-form.jade`)(),
    link(s, elem, attrs, mForm) {

      mForm.initialize = false;
      mForm.theme = moduleName;

      mForm.form = angular.isObject(mForm.item) ?
        angular.extend({}, mForm.item) :
        {
          person: {},
          company: {}
        };

      mForm.update = !!mForm.form.id ? true : false;

      const init = () => M.find().$promise
        .then(cs => {
          mForm.initialize = true;
          mForm.clients = cs;
          if (!!mForm.item) {
            mForm.form.clientType = !!mForm.item.person ? 0 : 1;
            if (!!mForm.item.person) {
              mForm.personaId = mForm.item.person.id;
            }else if (!!mForm.item.company) mForm.companyId = mForm.item.company.id;
          }
        });

      init();

      mForm.loadPersons = () => P.find().$promise
        .then(items => l.checkAvailables(items, mForm.clients, 'typeId'))
        .then(results => mForm.persons = results);

      mForm.loadCompanies = () => C.find({filter: {
          where: {main: {neq: true}}
        }}).$promise
        .then(items => l.checkAvailables(items, mForm.clients, 'typeId'))
        .then(results => mForm.companies = results);

      mForm.save = (form) => l.saveItem({
        Model: M,
        mForm: mForm,
        modelName: 'client',
        onlySend: true,
        dataToSend: {
          type: mForm.form.clientType === 0 ? 'person' : 'company',
          typeId: mForm.form.clientType === 0 ?
            mForm.personaId : mForm.companyId
        },
        formSuccess: () => l.closeSidenav('right')
      });

      mForm.saveCC = () => l.saveItem({
        Model: M,
        mForm: mForm,
        modelName: 'client',
        onlySend: true,
        upsertItem: true,
        formSuccess: () => l.closeSidenav('right')
      });

    }
  })]);
