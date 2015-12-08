export function rules(uRP) {
  uRP.when('/home', '/');
  uRP.when('/inicio', '/');
}

export function routes(stateProvider) {

  stateProvider

    .state('home', {
      parent: 'layout',
      url: '/',
      resolve: {
        r: ['layout', '$q', (l, $q) => {
          return $q.all([
            l.loadTranslatePart('home'),
            l.loadTranslatePart('login')
          ]);
        }]
      },
      views: {
        content: {
          controllerAs: 'home',
          template: require('./templates/home.jade')(),
          controller: ['layout', () => {
          }]
        }
      }
    });

}

