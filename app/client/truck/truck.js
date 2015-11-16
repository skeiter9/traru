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
      priority: 10,
      template: require('./templates/truck-form.jade')(),
      link(e, elem, attrs, mForm) {
        //console.log(mForm.item);
        mForm.form = angular.extend({}, mForm.item);

        mForm.save = (form) => vForm(form)
          .then((result) => $q.all([!!mForm.item ?
            T.prototype$updateAttributes({where: {id: mForm.item.id}},
              mForm.form).$promise :
            T.create(mForm.form).$promise
          ]))
          .then((truck) => {
            $l.debug('truck is registered: ', truck);
            l.closeSidenav('right');
          })
          .catch((err) => {
            $l.debug(err);
            vFormU.catchError(err);
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

        const sidenavRightAction = ({title, tag, item, titleVars = {}}) => {
          const scope = s.$new();
          scope.item = item;
          l.sidenavRightToolbarTitle = title;
          l.sidenavRightToolbarTitleVars = titleVars;
          l.sidenavRightToolbarIconLeft = 'close';
          l.sidenavRightToolbarIconLeftAction = (e) => l.closeSidenav('right');

          l.sidenavRightContent = {
            html: `<${tag} item='item' />`,
            scope: scope
          };

          return l.openSidenav('right');
        };

        trucks.addItem = (e) => {
          l.sidenavRightToolbarTitle = 'NEW_TRUCK';
          l.sidenavRightToolbarIconLeft = 'close';
          l.sidenavRightToolbarIconLeftAction = (e) => {
            l.closeSidenav('right');
          };

          l.sidenavRightContent = {
            html: `<truck-form />`
          };

          l.openSidenav('right');
        };

        trucks.showItem = (e, item) => sidenavRightAction({
          title: item.licensePlate,
          tag: 'truck',
          item: item
        });

        trucks.editItem = (e, item) =>sidenavRightAction({
          title: `SENTENCES.EDIT`,
          tag: 'truck-form',
          item: item,
          titleVars: {item: item.licensePlate}
        });

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
