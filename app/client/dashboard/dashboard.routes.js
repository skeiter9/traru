const formatModel = (moduleName) => moduleName.slice(0, 1).toUpperCase() +
  moduleName.slice(1);

const formatPropTitle = (update, item, propTitle) => !update ? '' :
  angular.isObject(item) ?
    angular.isString(propTitle) ? item[propTitle] :
    angular.isFunction(propTitle) ? propTitle(item) : '' :
  '';

const deleteItem = ({moduleName, modulePluralName = moduleName + 's',
propTitle, includeModules = []}) => ({
  url: `^/${modulePluralName}/:id/delete`,
  auth: true,
  onExit: ['layout', (l) => l.closeSidenav('right')],
  views: {
    'sidenavRight@layout': {
      template: ``,
      controller: ['layout', `${formatModel(moduleName)}`, '$state', '$q',
      function(l, M, $st, $q) {

        M.find({filter: {where: {id: $st.params.id},
        include: includeModules}}).$promise
          .then(items => {
            const item = items[0];
            l.loadTranslatePart(moduleName);
            l.sidenavRighTheme = moduleName;
            l.sidenavRightToolbarTitle = '';
            return l.loadStateEnd().then(() => item);
          })
          .then(item => l.removeItem({
              model: M,
              item: item,
              title: formatPropTitle(true, item, propTitle),
              modelName: moduleName,
              formSuccess: () => $st.go('^'),
              formError: () => $st.go('^')
            })
          );
      }]
    }
  }
});

const formItem = ({moduleName, modulePluralName = moduleName + 's',
update = false, propTitle, includeModules = []}) => ({
  url: update ?
    `^/${modulePluralName}/:id/edit` :
    `^/${modulePluralName}/create`,
  auth: true,
  onExit: ['layout', (l) => l.closeSidenav('right')],
  views: {
    'sidenavRight@layout': {
      template: `
        <${moduleName}-form
          ng-if='vmFormItem.initialize'
          item='vmFormItem.item'
          md-theme="${moduleName}"
          form-success='vmFormItem.formSuccess()'
        />
      `,
      controllerAs: 'vmFormItem',
      controller: ['layout', '$state', '$q', `${formatModel(moduleName)}`,
      function(l, $st, $q, M) {
        this.formSuccess = () => l.closeSidenav('right')
          .then(() => $st.go('^'));
        (update ?
          M.find({filter: {where: {id: $st.params.id},
            include: includeModules}}).$promise :
          $q.when()
        )
          .then(data => {
            this.item = update ? data[0] : null;
            const nameItem = formatPropTitle(update, this.item, propTitle);
            l.loadTranslatePart(moduleName);
            l.sidenavRighTheme = moduleName;
            l.sidenavRightToolbarTitle = update ?
              `MODULE.EDIT_${moduleName.toUpperCase()}` :
              `MODULE.NEW_${moduleName.toUpperCase()}`;
            l.sidenavRightToolbarTitleVars = update ? {name: nameItem} : {};
            this.initialize = true;
            return l.loadStateEnd().then(() => l.openSidenav('right'));
          });
      }]
    }
  }
});

const showItem = ({moduleName, modulePluralName = moduleName + 's'}) => ({
  url: `^/${modulePluralName}/:id`,
  auth: true,
  onExit: ['layout', (l) => l.closeSidenav('right')],
  views: {
    'sidenavRight@layout': {
      template: `
        <${modulePluralName} ng-if='vmShow.initialize' item='vmShow.item'/>
      `,
      controllerAs: 'vmShow',
      controller: ['layout', `${formatModel(moduleName)}`, '$state',
      function(l, M, $st) {
        M.find({filter: {where: {id: $st.params.id}}}).$promise
          .then((trucks) => {
            this.item = trucks[0];
            l.loadTranslatePart(moduleName);
            l.sidenavRighTheme = moduleName;
            l.sidenavRightToolbarTitle = this.item.licensePlate;
            l.loadStateEnd().then(() => {
              this.initialize = true;
              return l.openSidenav('right');
            });
          });
      }]
    }
  }
});

export function rules(uRP) {
  uRP.when('/panel-de-control', '/dashboard');
  uRP.when('/panel', '/dashboard');
}

export function routes(stateProvider) {

  stateProvider

    .state('dashboard', {
      parent: 'layout',
      url: '/dashboard',
      auth: true,
      resolve: {r: ['layout', (l) => l.resolveState('dashboard')]},
      views: {
        content: {
          controllerAs: 'dashboard',
          template: require('./templates/dashboard.jade')(),
          controller: 'DashboardController'
        }
      }
    })

    .state('dashboard.truckUbication', {
      url: '^/trucks/:id/ubication',
      auth: true,
      onExit: ['layout', (l) => l.closeSidenav('right')],
      views: {
        'sidenavRight@layout': {
          template: `
          `,
          controllerAs: 'vmTruckUbication',
          controller: ['layout', 'Truck', '$state', '$translate', 'gmap',
          function(l, T, $st, $tr, gm) {
            T.find({filter: {where: {id: $st.params.id}}}).$promise
              .then((trucks) => {
                const item = trucks[0];
                l.loadStateEnd()
                  .then(() => {
                    gm.launchMap({
                      geoposition: item.ubication,
                      title: item.licensePlate,
                      showMarker: true,
                      inDialog: true,
                      theme: 'truck'
                    })
                      .catch(a => $st.go('^'));
                  });
              });
          }]
        }
      }
    })

    //- truck
    .state('dashboard.truckCreate', formItem({
      moduleName: 'truck'
    }))
    .state('dashboard.truckShow', showItem({
      moduleName: 'truck'
    }))
    .state('dashboard.truckDelete', deleteItem({
      moduleName: 'truck',
      propTitle: 'licensePlate'
    }))
    .state('dashboard.truckUpdate', formItem({
      moduleName: 'truck',
      update: true,
      propTitle: 'licensePlate'
    }))

    //- department
    .state('dashboard.departmentCreate', formItem({
      moduleName: 'department'
    }))
    .state('dashboard.departmentShow', showItem({
      moduleName: 'department'
    }))
    .state('dashboard.departmentDelete', deleteItem({
      moduleName: 'department',
      propTitle: 'id'
    }))
    .state('dashboard.departmentUpdate', formItem({
      moduleName: 'department',
      update: true,
      propTitle: 'id'
    }))

    //- cargo
    .state(`dashboard.${'cargo'}Create`, formItem({
      moduleName: 'cargo'
    }))
    .state(`dashboard.${'cargo'}Show`, showItem({
      moduleName: 'cargo'
    }))
    .state(`dashboard.${'cargo'}Delete`, deleteItem({
      moduleName: 'cargo',
      propTitle: 'id'
    }))
    .state(`dashboard.${'cargo'}Update`, formItem({
      moduleName: 'cargo',
      update: true,
      propTitle: 'id'
    }))

    //- worker
    .state('dashboard.workerCreate', formItem({
      moduleName: 'worker'
    }))
    .state('dashboard.workerShow', showItem({
      moduleName: 'worker'
    }))
    .state('dashboard.workerDelete', deleteItem({
      moduleName: 'worker',
      propTitle: 'id'
    }))
    .state('dashboard.workerUpdate', formItem({
      moduleName: 'worker',
      update: true,
      propTitle: 'id'
    }))

    //- route
    .state('dashboard.routeCreate', formItem({
      moduleName: 'route'
    }))
    .state('dashboard.routeShow', showItem({
      moduleName: 'route'
    }))
    .state('dashboard.routeDelete', deleteItem({
      moduleName: 'route',
      propTitle: 'id'
    }))
    .state('dashboard.routeUpdate', formItem({
      moduleName: 'route',
      update: true,
      propTitle: 'id'
    }))

    //- client
    .state('dashboard.clientCreate', formItem({
      moduleName: 'client'
    }))
    .state('dashboard.clientShow', showItem({
      moduleName: 'client'
    }))
    .state('dashboard.clientDelete', deleteItem({
      moduleName: 'client',
      propTitle: (item) => !!item.person ?
        item.person.firstName : item.company.socialName,
      includeModules: ['person', 'company']
    }))
    .state('dashboard.clientUpdate', formItem({
      moduleName: 'client',
      update: true,
      propTitle: (item) => !!item.person ?
        item.person.firstName : item.company.socialName,
      includeModules: ['person', 'company']
    }));

}

