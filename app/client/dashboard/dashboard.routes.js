export function rules(urlRouterProvider) {
  urlRouterProvider.when('/panel-de-control', '/');
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
          template: '<h1> Hi from routes </h1>'

          //controllerAs: 'dashboard',
          //templateProvider: ['layoutFactory', (lF) => lF.ui.viewTemplate],
          //controllerProvider: ['layoutFactory', (lF) => lF.ui.controllerName]
        }
      }
    });
}
