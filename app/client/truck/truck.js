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
  (l, $l, vForm, T, $mdT, $tr, vFormU, $q) => ({
    restrict: 'E',
    scope: {
      item: '='
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'mForm',
    template: require(`./templates/${moduleName}-form.jade`)(),
    link(e, elem, attrs, mForm) {

      mForm.theme = 'truck';

      mForm.form = angular.isObject(mForm.item) ?
        angular.extend({}, mForm.item) : {};

      mForm.formAux = {
        status: [
          {value: 1, label: 'SENTENCES.AVAILABLE'},
          {value: 0, label: 'SENTENCES.IN_ROUTE'},
          {value: -1, label: 'SENTENCES.IN_MECHANIC'},
          {value: -2, label: 'SENTENCES.OUT_SERVICE'}
        ]
      };

      mForm.update = !!mForm.form.id ? true : false;

      mForm.save = (form) => vForm(form)
        .then(() => $q.all([!!mForm.item ?
          T.prototype$updateAttributes({where: {id: mForm.item.id}},
            mForm.form).$promise :
          T.create(mForm.form).$promise
        ]))
        .then((truck) => {
          $l.debug('truck is registered: ', truck[0]);
          l.closeSidenav('right');
        })
        .catch((err) => {
          $l.debug(err);
          vFormU.catchError({
            err: err,
            modelName: 'truck',
            operation: mForm.update ? 'edit' : 'new'
          });
        });

    }
  })])

  .directive('truck', ['layout', '$log', (l, $l) => ({
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
  '$log',
  (l, gm, T, $tr, $l) => {
    return {
      restrict: 'E',
      scope: {
        model: '='
      },
      bindToController: true,
      controller: angular.noop,
      controllerAs: 'trucks',
      template: require(`./templates/${moduleName}-list.jade`)(),
      link(s, elem, attrs, trucks) {

        trucks.initialize = false;

        if (trucks.model.crud.r.status) {
          trucks.model.model.find().$promise
          .then((items) => {
            trucks.items = items;
            trucks.initialize = true;
          })
          .catch((err) => {
            console.warn(err);
            trucks.initialize = true;
          });
        }

        trucks.ubicationItem = (e, item) => gm.launchMap({
          event: e,
          geoposition: item.ubication,
          title: item.licensePlate,
          showMarker: true,
          inDialog: true
        });

        trucks.showItem = (e, item) => l.sidenavRightAction({
          scope: s,
          title: item.licensePlate,
          tag: 'truck',
          item: item,
          theme: 'truck'
        });

        trucks.addItem = (e) => l.sidenavRightAction({
          scope: s,
          title: `SENTENCES.NEW`,
          titleVars: {moduleName: $tr.instant('MODEL.TRUCK')},
          tag: 'truck-form',
          theme: 'truck'
        });

        trucks.editItem = (e, item) => l.sidenavRightAction({
          scope: s,
          title: `SENTENCES.EDIT`,
          titleVars: {item: item.licensePlate},
          tag: 'truck-form',
          item: item,
          theme: 'truck'
        });

        trucks.removeItem = (e, item) => l.removeItem({
          evt: e,
          model: T,
          item: item,
          title: item.licensePlate,
          modelName: 'truck'
        });

      }

    };
  }]);
