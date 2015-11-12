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
        resolve: ['routing', '$q', (r, $q) => {
          return $q((resolve, reject) => {
            r.state.loggued = r.isLoggued();
            resolve();
          });
        }]
      },
      views: {
        content: {
          controllerAs: 'dashboard',
          templateProvider: ['routing', (r) => {
            return r.state.loggued ?
              require('./templates/dashboard.jade')() :
              require('../login/templates/login.jade')();
          }],

          controllerProvider: ['routing', (r) => r.state.loggued ?
            'DashboardController' : 'LoginController'
          ]

          //controller: 'DashboardController'
        }
      }
    });
}
