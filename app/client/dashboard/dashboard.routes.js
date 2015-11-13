export function rules(urlRouterProvider) {
  urlRouterProvider.when('/panel-de-control', '/');
  urlRouterProvider.when('/panel', '/');
  urlRouterProvider.when('/home', '/');
  urlRouterProvider.when('/inicio', '/');
}

export function routes(stateProvider) {

  stateProvider

    .state('dashboard', {
      parent: 'layout',
      url: '/',
      resolve: {
        resolve: ['layout', l => l.loadState('dashboard')]
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

          //controller: 'DashboardController'
        }
      }
    });
}
