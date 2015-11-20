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

  .config(['gmapProvider', (gmP) => {
    gmP.setDefaultCoordinates({lat: -6.776864, lng: -79.843937});
  }])

  .directive('truckForm', ['layout', '$log', 'yeValidForm', 'Truck', '$mdToast',
  '$translate', 'validFormUtils', '$q',
  (l, $l, vForm, T, $mdT, $tr, vFormU, $q) => {
    return {
      restrict: 'E',
      scope: {
        item: '='
      },
      bindToController: true,
      controller: angular.noop,
      controllerAs: 'mForm',
      template: require('./templates/truck-form.jade')(),
      link(e, elem, attrs, mForm) {

        mForm.form = angular.isObject(mForm.item) ?
          angular.extend({}, mForm.item) : {};

        mForm.formAux = {};
        mForm.update = !!mForm.form.id ? true : false;
        if (angular.isObject(mForm.form.ubication)
        ) mForm.formAux.ubication = JSON.stringify(mForm.form.ubication);

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
    };
  }])

  .directive('truck', ['layout', '$log', (l, $l) => {
    return {
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

    };
  }])

  .directive('trucks', ['layout', 'gmap', 'Truck', '$translate', '$log',
  (l, gm, T, $tr, $l) => {
    return {
      restrict: 'E',
      scope: {
        model: '='
      },
      bindToController: true,
      controller: angular.noop,
      controllerAs: 'trucks',
      template: require('./templates/trucks.jade')(),
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

        trucks.showItem = (e, item) => l.sideavRightAction({
          scope: s,
          title: item.licensePlate,
          tag: 'truck',
          item: item
        });

        trucks.addItem = (e) => l.sideavRightAction({
          scope: s,
          title: `SENTENCES.NEW`,
          titleVars: {modelName: $tr.instant('MODEL.TRUCK')},
          tag: 'truck-form'
        });

        trucks.editItem = (e, item) => l.sideavRightAction({
          scope: s,
          title: `SENTENCES.EDIT`,
          titleVars: {item: item.licensePlate},
          tag: 'truck-form',
          item: item
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
