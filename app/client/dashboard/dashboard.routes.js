export function rules(uRP) {
  uRP.when('/panel-de-control', '/');
  uRP.when('/panel', '/');
  uRP.when('/home', '/');
  uRP.when('/inicio', '/');
}

export function routes(stateProvider) {

  stateProvider

    .state('home', {
      parent: 'layout',
      url: '/',
      views: {
        content: {
          controllerAs: 'Login',
          template: require('../home/templates/home.jade')(),
          controller: 'LoginController'
        }
      }
    })

    .state('dashboard', {
      parent: 'layout',
      url: '/dashboard',
      auth: true,
      views: {
        content: {
          controllerAs: 'dashboard',
          template: require('./templates/dashboard.jade')(),
          controller: 'DashboardController'
        }
      }
    });

}
