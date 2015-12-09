const moduleName = 'worker';
const modelName = moduleName.slice(0, 1).toUpperCase() +
  moduleName.slice(1).toLowerCase();

import utilsDirectives from '../utils/utils-directive/utils.directive.js';
import personAm from '../person/person.js';

export default angular.module(`traru${modelName}`, [
  utilsDirectives.name,
  personAm.name,
])

  .directive(`${moduleName}List`, ['layout', modelName, '$translate', '$log',
  (l, M, $tr, $l) => ({
    restrict: 'E',
    scope: {
      module: '='
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'vm',
    template: require(`./templates/${moduleName}-list.jade`)(),
    link(s, elem, attrs, vm) {

      const init = () =>l.validModule(vm.module)

        .then(() => vm.module.model.find({
          filter: {include: 'person'}
        }).$promise)

        .then(items => {
          vm.items = items;
          vm.initialize = true;
        })

        .catch(err => {
          $l.debug(err);
          vm.initialize = true;
        });

      init();

      l.crudRoutes({
        moduleName: 'worker',
        vm: vm
      });

    }

  })])

  .directive(`${moduleName}Form`, ['layout', modelName, 'Person', 'Department',
  '$mdToast', '$translate', '$q', 'async',
  (l, M, P, D, $mdT, $tr, $q, async) =>({
    restrict: 'E',
    scope: {
      item: '='
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'mForm',
    template: require(`./templates/${moduleName}-form.jade`)(),
    link(s, elem, attrs, mForm) {

      mForm.loadPersons = () => P.find().$promise
        .then(items => l.checkAvailables(items, mForm.items))
        .then(items => mForm.persons = items);

      const loadCargos = () => D.find({filter: {include: ['cargos']}}).$promise
        .then(items => items.length === 0 ?
          $q((re, r) => r($tr.instant('MODULE.NO_ITEMS', {
            modulePlural: $tr.instant('MODEL.DEPARTMENT_PLURAL')
          }))) :
          items
        )
        .then(res => $q((resolve, reject) => async.detect(res,
            (item, cb) => cb(
              angular.isDefined(item.cargos) && item.cargos.length > 0
            ),
            (results) => angular.isDefined(results) ?
              resolve(res) :
              reject($mdT.showSimple($tr.instant('MODULE.NO_ITEMS', {
                modulePlural: $tr.instant('MODEL.CARGO_PLURAL')
              })))
          ))
        )
        .then(res => mForm.departments = res);

      const init = () => loadCargos()
        .catch(() => mForm.noCargos = true)
        .then(() => {

          mForm.update = angular.isObject(mForm.item) &&
            angular.isString(mForm.item.id);

          mForm.form = mForm.update ?
            angular.extend({}, mForm.item) :
            {cargos: [], person: {}};

          mForm.formAux = {
            cargos: {}
          };

        });

      const parsePerson = (person, initialize = true) => $q((resolve, rej) => {
        if (!initialize && mForm.formAux.personId !== '0'
        ) mForm.form.person.id = mForm.formAux.personId;
        resolve();
      });

      const parseCargos = (auxCargos) => $q((resolve, reject) => {
        let cargos = [];
        async.forEachOf(auxCargos,
          (item, key, cb) => cb(null, cargos.push(key)),
          (err) => cargos.length === 0 ? reject('no_cargos') : resolve(cargos)
        );
      });

      init();

      mForm.save = form => parsePerson(mForm.person, false)
        .then(() => parseCargos(mForm.formAux.cargos))
        .then(cargos => mForm.form.cargos = cargos)
        .then(() =>l.saveItem({
          Model: M,
          form: form,
          mForm: mForm,
          modelName: 'worker',
          upsertItem: true,
          dataTosend: {
            person: mForm.form.person,
            cargos: mForm.form.cargos,
            user: mForm.form.user
          },
          formSuccess: () => l.closeSidenav('right')
        }))

        .catch(err => err === 'no_cargos' ?
          $mdT.showSimple($tr.instant('WORKER.ADD_CARGO')) :
          err
        );

    }
  })]);
