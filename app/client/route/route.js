const moduleName = 'route';
const modelName = moduleName.slice(0, 1).toUpperCase() +
  moduleName.slice(1).toLowerCase();

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
          angular.extend({}, {waypoints: []}, mForm.item) : {waypoints: []};

        mForm.formAux = {
          waypoints: []
        };

        const validData = () => $q.all([
          W.find({filter:
            {include: ['cargos', 'person']}}
          ).$promise,
          T.find().$promise,
          C.find({
            filter: {include: ['person', 'company']}
          }).$promise
        ])
          .then((results) => {
            if (results[0].length === 0) mForm.lackData = 'worker';
            else if (results[1].length === 0) mForm.lackData = 'truck';
            else if (results[2].length === 0) mForm.lackData = 'client';
          })

        mForm.lackData = '';
        validData();

        mForm.update = !!mForm.form.id ? true : false;

        mForm.addWaypoint = () => mForm.formAux.waypoints.push({});

        mForm.loadDrivers = () => W.find({filter:
          {include: ['cargos', 'person']}}
        ).$promise
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
        .then(() => {
          console.log(mForm)
          const parsedWaypoints = mForm.form.waypoints.map((w) => {
            console.log(w);
            return w.location
          });
          const dataToSend = angular.extend({}, mForm.form, {waypoints: parsedWaypoints});
          console.log(dataToSend);
          return $q.all([!!mForm.item && angular.isDefined(mForm.item.id) ?
            R.prototype$updateAttributes({where: {id: mForm.item.id}},
              dataToSend).$promise :
            R.create(dataToSend).$promise
          ])
        })
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
  (l, gm, T, $tr, $l) => ({
    restrict: 'E',
    scope: {
      module: '='
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'vm',
    template: require('./templates/routes.jade')(),
    link(s, elem, attrs, vm) {

      const init = () => {
        if (vm.module.crud.r.status) vm.module.model.find({filter: {
          include: ['truck', {client: ['person', 'company']}, {worker: 'person'}]
        }}).$promise

          .then(items => {
            console.log(items)
            vm.items = items;
            vm.initialize = true;
          })

          .catch(err => {
            $l.debug(err);
            vm.initialize = true;
          });
        else vm.initialize = true;

      };

      init();

      l.crudRoutes({
        moduleName: 'route',
        vm: vm
      });

    }

  })]);
