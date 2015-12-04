export function rules(uRP) {
  uRP.when('/panel-de-control', '/');
  uRP.when('/panel', '/');
  uRP.when('/home', '/');
  uRP.when('/inicio', '/');
}

export function routes(stateProvider) {

  stateProvider

    .state('dashboard', {
      parent: 'layout',
      url: '/',
      resolve: {
        resolve: ['layout', '$q', 'Truck', 'Route', 'Client', 'Worker',
				'Company',
        (l, $q, T, R, C, W, Co) => l.loadState({
          stateName: 'dashboard',
          models: [
            {name: 'truck', model: T},
            {name: 'company', model: Co},
            {name: 'route', model: R},
            {name: 'client', model: C},
            {name: 'worker', model: W}
          ]
        })]
      },
      views: {
        content: {
          controllerAs: 'dashboard',
          templateProvider: ['layout', (l) => {
            return l.loggued ?
              require('./templates/dashboard.jade')() :
              require('../login/templates/login.jade')();
          }],

          controllerProvider: ['layout', (l) => l.loggued ?
            'DashboardController' : 'LoginController'
          ]
        }
      }
    })

    .state('dashboard.trucks', {
      url: 'trucks',
      resolve: {
        boot: ['layout', (l) => {
        }]
      },
      views: {
        'sidenavRight@layout': {
          template: '<truck-form />',
          controller: ['layout', (l) => {
            console.log('trucks');
            setTimeout(() => {
              l.openSidenav('right');
            }, 0);
          }]
        }
      }
    });

}
