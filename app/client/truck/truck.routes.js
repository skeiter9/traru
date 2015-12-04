export function rules(uRP) {
  uRP.when('/camiones', '/trucks');
}

export function routes(stateProvider) {

  stateProvider

    .state('trucks', {
      parent: 'layout',
      url: '/trucks',
      resolve: {
        resolve: ['layout', '$q', 'Truck',
        (l, $q, T) => l.loadState({
          stateName: 'truck',
          models: []
        })]
      },
      views: {
        'sidenavRight@layoutPre': {
          controllerAs: 'vmTrucks',
          template: '<trucksF />',
          controller: [function() {
          }]
        }
      }
    });
}
