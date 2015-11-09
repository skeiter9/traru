export function rules(urlRouterProvider) {
  urlRouterProvider.when('/acceso', '/');
}

export function routes(stateProvider) {

  stateProvider

    .state('login', {
      parent: 'layout',
      url: '/login',
      resolve: {
        //boot: ['layoutFactory', (lF) => lF.stateLoad('dashboard')]
      },
      views: {
        content: {
          template: 'login'

          //controllerAs: 'dashboard',
          //templateProvider: ['layoutFactory', (lF) => lF.ui.viewTemplate],
          //controllerProvider: ['layoutFactory', (lF) => lF.ui.controllerName]
        }
      }
    });
}
