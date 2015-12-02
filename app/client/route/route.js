import mdxIconAM from '../utils/icon.directive';
import sidenavAM from '../utils/sidenav.directive';
import coverAM from '../utils/cover.directive';
import googleMapAM from '../utils/google-map';
import ngFW from '../utils/ng-file-upload-wrapper/ng-file-upload-wrapper';

export default angular.module('traruRoute', [
  mdxIconAM.name,
  sidenavAM.name,
  coverAM.name,
  googleMapAM.name,
  ngFW.name
])

  .directive('routeForm', ['layout', '$log', 'yeValidForm', 'Route', '$mdToast',
  '$translate', 'validFormUtils', '$q', 'async', 'Truck', 'Client', 'Worker',
  (l, $l, vForm, R, $mdT, $tr, vFormU, $q, async, T, C, W) => {
    return {
      restrict: 'E',
      scope: {
        item: '='
      },
      bindToController: true,
      controller: angular.noop,
      controllerAs: 'mForm',
      template: require('./templates/route-form.jade')(),
      link(e, elem, attrs, mForm) {

        mForm.theme = 'route';

        mForm.form = angular.isObject(mForm.item) ?
          angular.extend({}, mForm.item) : {waypoints: []};

        mForm.formAux = {
          waypoints: []
        };
        mForm.update = !!mForm.form.id ? true : false;

        mForm.addWaypoint = () => mForm.formAux.waypoints.push({});

        mForm.loadDrivers = () => W.find({filter: {include: 'cargos'}}).$promise
          .then(items => mForm.drivers = items);

        mForm.loadTrucks = () => T.find().$promise
        .then(trucks => {
          if (trucks.length > 0) {
            return $q((resolve, reject) => {
              let availables = [];
              let noAvailables = [];
              async.each(trucks,
              (truck, cb) => {
                if (truck.status === 1) availables.push(truck);
                else noAvailables.push(truck);
                cb(null);
              },

              (err) => {
                mForm.trucks = availables;
                mForm.trucksNoAvailables = noAvailables;
                resolve(trucks);
              });
            });
          }else $mdT.showSimple($tr.instant('API.NON_ITEMS', {
            modelPlural: $tr.instant('MODEL.TRUCK_PLURAL')
          }));
        })
        .catch((err) => $.debug('don\'t fetch trucks from api'));

        mForm.loadClients = () => C.find({
          filter: {include: ['person', 'company']}
        }).$promise
        .then(items => mForm.clients = items)
        .catch((err) => $.debug('don\'t fetch clients from api'));

        mForm.save = (form) => vForm(form)
        .then(() => $q.all([!!mForm.item ?
          R.prototype$updateAttributes({where: {id: mForm.item.id}},
            mForm.form).$promise :
          R.create(mForm.form).$promise
        ]))
        .then((route) => {
          $l.debug('route is registered: ', route[0]);
          return l.closeSidenav('right');
        })
        .catch((err) => {
          $l.debug(err);
          vFormU.catchError({
            err: err,
            modelName: 'route',
            operation: mForm.update ? 'edit' : 'new'
          });
        });

      }
    };
  }])

  .directive('route', ['layout', '$log', (l, $l) => ({
    restrict: 'E',
    scope: {
      item: '='
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'truck',
    template: require('./templates/route.jade')(),
    link(s, elem, attrs, truck) {

      if (angular.isUndefined(truck.item) || !angular.isObject(truck.item)) {
        $l.warn('truck data is not seted');
        return;
      }

    }

  })])

  .directive('routeList', ['layout', 'gmap', 'Truck', '$translate', '$log',
  (l, gm, T, $tr, $l) => {
    return {
      restrict: 'E',
      scope: {
        model: '='
      },
      bindToController: true,
      controller: angular.noop,
      controllerAs: 'module',
      template: require('./templates/routes.jade')(),
      link(s, elem, attrs, module) {

        if (angular.isUndefined(module.model)) {
          $l.debug('don\'t set model for routes:directive');
          return;
        }

        module.initialize = false;

        if (module.model.crud.r.status) {
          module.model.model.find().$promise
          .then((items) => {
            module.items = items;
            module.initialize = true;
          })
          .catch((err) => {
            console.warn(err);
            module.initialize = true;
          });
        } else module.initialize = true;

        module.ubicationItem = (e, item) => gm.launchMap({
          event: e,
          geoposition: item.ubication,
          title: item.licensePlate,
          showMarker: true,
          inDialog: true
        });

        module.showItem = (e, item) => l.sidenavRightAction({
          scope: s,
          title: item.licensePlate,
          tag: 'route',
          item: item,
          className: 'x2',
          theme: 'route'
        });

        module.addItem = (e) => l.sidenavRightAction({
          scope: s,
          title: `SENTENCES.NEW`,
          titleVars: {moduleName: $tr.instant('MODEL.ROUTE')},
          tag: 'route-form',
          className: 'x2',
          theme: 'route'
        });

        module.editItem = (e, item) => l.sidenavRightAction({
          scope: s,
          title: `SENTENCES.EDIT`,
          titleVars: {item: item.licensePlate},
          tag: 'route-form',
          item: item,
          className: 'x2',
          theme: 'route'
        });

        module.removeItem = (e, item) => l.removeItem({
          evt: e,
          model: T,
          item: item,
          title: item.licensePlate,
          modelName: 'route'
        });

      }

    };
  }]);
