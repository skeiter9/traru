export function rules(urlRouterProvider) {

  urlRouterProvider

    .rule(($injector, $location) => {
      let path = $location.path();
      let normalized = $location.path().toLowerCase();
      if ($location.path() !== normalized) return normalized;
    })

    .rule(($injector, $location) => {
      let path = $location.path();
      if (/\s/.test(path)) return path.replace(/\s/g, '-');
    });

}

export function routes(stateProvider) {

  stateProvider

    .state('layout', {
      abstract: true,
      template: require('./templates/layout.jade')(),
      controller: 'LayoutController',
      controllerAs: 'layout'
    })

    .state('e404', {
      url: '/{failState:[a-zA-Z0-9-]+}',
      parent: 'layout',
      resolve: {
        //boot: ['layoutFactory', (lF) => lF.stateLoad('e404')]
      },
      params: {
        failState: ''
      },
      views: {
        content: {
          template: require('./views/e404.jade')(),
          controllerAs: 'e404',
          controller: ['$state', function E404Controller($s) {
            this.failState = $s.params.failState;

            //let appbarTitle = `404${
            //  $sP.failState !== '404' ? ': ' + $sP.failState : ''}`;
            //lF.appbarTitle = appbarTitle;
          }]
        },
      }
    });
  /*
    .state('help', {
      url: '/help',
      parent: 'layout',
      resolve: {
        boot: ['layoutFactory', (lF) => lF.stateLoad('help')]
      },
      views: {
        'content@base': {
          template: require('./views/help.jade')(),
          controller: ['layoutFactory', HelpController]
        },
      }
    });
  */
}

//help
function HelpController(lF) {
  lF.appbarTitle = 'help';
}
