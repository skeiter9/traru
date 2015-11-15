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

  .directive('truckNew', ['layout', '$log', 'yeValidForm', 'Truck', '$mdToast',
  '$translate',
  (l, $l, vForm, T, $mdT, $tr) => {
    return {
      restrict: 'E',
      scope: {},
      bindToController: true,
      controller: angular.noop,
      controllerAs: 'mForm',
      template: require('./templates/truck-new.jade')(),
      link(e, elem, attrs, mForm) {
        mForm.save = (form) => vForm(form)
        .then((result) => T.create(mForm.form).$promise)
        .then((truck) => {
          $l.debug('truck is registered: ', truck);
          l.closeSidenav('right');
        })
        .catch((err) => {
          //$l.debug(err);

          const errCode = !!err.errorOne ? err.errorOne.messageCode :
            !!err.data && !!err.data.error && !!err.data.error.code ?
            err.data.error.code : 'FORM.WRONG';

          const fieldOne = (!!err.errorOne ? err.errorOne.field : '')
            .toUpperCase();

          return $mdT.showSimple($tr.instant(errCode, {
            field: $tr.instant('FIELDS.' + fieldOne)
          }));

          //if (!!err.errorOne) $mdT.showSimple(err.errorOne.messageCode);
          //else if (!!err.data && !!err.data.error && !!err.data.error.code
          //) $mdT.showSimple(err.data.error.code);
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

  .directive('trucks', ['layout', 'gmap', function(l, gm) {
    return {
      restrict: 'E',
      scope: {
        items: '='
      },
      bindToController: true,
      controller: angular.noop,
      controllerAs: 'trucks',
      template: require('./templates/trucks.jade')(),
      link(s, elem, attrs, trucks) {

        trucks.addItem = (e) => {
          l.sidenavRightToolbarTitle = 'NEW_TRUCK';
          l.sidenavRightToolbarIconLeft = 'close';
          l.sidenavRightToolbarIconLeftAction = (e) => {
            l.closeSidenav('right');
          };

          l.sidenavRightContent = {
            html: `<truck-new />`
          };

          l.openSidenav('right');
        };

        trucks.showItem = (e, item) => {
          const scope = s.$new();
          scope.item = item;
          l.sidenavRightToolbarTitle = item.licensePlate;
          l.sidenavRightToolbarIconLeft = 'close';
          l.sidenavRightToolbarIconLeftAction = (e) => {
            l.closeSidenav('right');
          };

          l.sidenavRightContent = {
            html: `<truck item='item' />`,
            scope: scope
          };

          l.openSidenav('right');
        };

        trucks.editItem = (e, item) => {};

        trucks.ubicationItem = (e, item) => {
          gm.launchMap({
            event: e,
            geoposition: item.geoposition,
            title: item.licensePlate,
            showMarker: true,
            inDialog: true
          });
        };

      }

    };
  }]);
