export function rules(urlRouterProvider) {
  urlRouterProvider.when('/panel-de-control', '/');
  urlRouterProvider.when('/panel', '/');
  urlRouterProvider.when('/home', '/');
}

export function routes(stateProvider) {

  stateProvider

    .state('dashboard', {
      parent: 'layout',
      url: '/',
      resolve: {
        //boot: ['layoutFactory', (lF) => lF.stateLoad('dashboard')]
      },
      views: {
        content: {
          template: require('./templates/dashboard.jade')(),
          controllerAs: 'dashboard',
          controller: 'DashboardController'

          //templateProvider: ['layoutFactory', (lF) => lF.ui.viewTemplate],
          //controllerProvider: ['layoutFactory', (lF) => lF.ui.controllerName]
        }
      }
    });
}
