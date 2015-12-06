export function rules(urlRouterProvider) {
  urlRouterProvider.when('/acceso', '/');
}

export function routes(stateProvider) {

  stateProvider

    .state('login', {
      parent: 'layout',
      url: '/login',
      views: {
        content: {
          controllerAs: 'Login',
          template: require('./templates/login.jade')(),
          controller: 'LoginController'
        }
      }
    });
}
