import mdxIconAM from '../utils/icon.directive';
import sidenavAM from '../utils/sidenav.directive';
import coverAM from '../utils/cover.directive';
import googleMapAM from '../utils/google-map/google-map';

export default angular.module('truck', [
  mdxIconAM.name,
  sidenavAM.name,
  coverAM.name,
  googleMapAM.name
])
  .config(['gmapProvider', (gmP) => {
    //gmP.setDefaultCoordinates({lat: -6.776864, lng: -79.843937});
  }])
  .directive('truckNew', ['layout', '$log', function(l, $l) {
    return {
      restrict: 'E',
      scope: {},
      bindToController: true,
      controller: angular.noop,
      controllerAs: 'truck',
      template: require('./templates/truck-new.jade')(),
      link(s, elem, attrs, truck) {

      }

    };
  }])
  .directive('truck', ['layout', '$log', function(l, $l) {
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

        gm.validCoordinates({});
        console.log(gm);
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

        trucks.ubicationItem = (e, item) => {};

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
      }

    };
  }]);
