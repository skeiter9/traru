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
        resolve: ['layout', 'Truck', '$q', (l, T, $q) => l.loadState({
          stateName: 'dashboard',
          models: [
            {name:'truck', model: T}
          ],
          fn: () => {
            if (l.loggued) l.loadTranslatePart('truck');
            return l.loggued ? T.find().$promise : $q.when([]);
          }
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
    });
}
