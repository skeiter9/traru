export function rules(uRP) {
  uRP.when('/home', '/');
  uRP.when('/inicio', '/');
}

export function routes(stateProvider) {

  stateProvider

    .state('home', {
      parent: 'layout',
      url: '/',
      resolve: {r: ['layout', (l) => l.resolveState('home', 'login')]},
      views: {
        content: {
          controllerAs: 'home',
          template: require('./templates/home.jade')(),
          controller: ['layout', '$q', function(l, $q) {
            l.loadStateEnd();
          }]
        }
      }
    });

}
