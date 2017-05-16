const moduleName = 'truck';
const modelName = moduleName.slice(0, 1).toUpperCase() +
  moduleName.slice(1).toLowerCase();

import mdxIconAM from '../utils/icon.directive';
import sidenavAM from '../utils/sidenav.directive';
import coverAM from '../utils/cover.directive';
import googleMapAM from '../utils/google-map';
import ngFW from '../utils/ng-file-upload-wrapper/ng-file-upload-wrapper';

export default angular.module('truck', [
  mdxIconAM.name,
  sidenavAM.name,
  coverAM.name,
  googleMapAM.name,
  ngFW.name
])

  .directive(`${moduleName}Form`, ['layout', '$log', 'yeValidForm', modelName,
  '$mdToast', '$translate', 'validFormUtils', '$q',
  (l, $l, vForm, M, $mdT, $tr, vFormU, $q) => ({
    restrict: 'E',
    scope: {
      item: '=',
      formSuccess: '&'
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'mForm',
    template: require(`./templates/${moduleName}-form.jade`)(),
    link(e, elem, attrs, mForm) {

      let defaultAttributes = {
        status: 1
      };

      mForm.form = angular.isObject(mForm.item) ?
        angular.extend({}, defaultAttributes, mForm.item) : defaultAttributes;

      mForm.formAux = {
        status: [
          {value: 1, label: 'SENTENCES.AVAILABLE'},
          {value: 0, label: 'SENTENCES.IN_ROUTE'},
          {value: -1, label: 'SENTENCES.IN_MECHANIC'},
          {value: -2, label: 'SENTENCES.OUT_SERVICE'}
        ]
      };

      mForm.update = l.isFormUpdate(mForm);

      mForm.save = (form) => l.saveItem({
        form: form,
        Model: M,
        mForm: mForm,
        modelName: 'truck',
        propTitle: 'licensePlate',
        formSuccess: mForm.formSuccess
      });
    }
  })])

  .directive('trucks', ['layout', '$log', (l, $l) => ({
    restrict: 'E',
    scope: {
      item: '='
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'truck',
    template: require('./templates/truck.jade')(),
    link(s, elem, attrs, truck) {

      if (angular.isUndefined(truck.item) || !angular.isObject(truck.item)) {
        $l.warn('truck data is not seted');
        return;
      }

    }

  })])

  .directive(`${moduleName}List`, ['layout', 'gmap', modelName, '$translate',
  '$log', '$rootScope',
  (l, gm, T, $tr, $l, $rs) => ({
    restrict: 'E',
    scope: {
      module: '='
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'vm',
    template: require(`./templates/${moduleName}-list.jade`)(),
    link(s, elem, attrs, vm) {

      const init = () => l.validModule(vm.module)

        .then(() => vm.module.model.find().$promise)

        .then(items => {
          vm.items = items;
          vm.initialize = true;
        })

        .catch(err => {
          vm.initialize = true;
        });

      init();

      l.crudRoutes({
        moduleName: 'truck',
        vm: vm
      });

      vm.ubicationItem = (e, item) => l.sidenavRightAction({
        toStateName: '.truckUbication',
        toStateParams: {id: item.id}
      });

      $rs.$on('refresh_trucks', () => {
        console.log('refreshTrucks')
        init();
      });

    }

  })]);
