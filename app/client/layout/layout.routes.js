export function rules(urlRouterProvider) {

  urlRouterProvider

  .rule(($injector, $location) => {
    const path = $location.path();
    const normalized = $location.path().toLowerCase();
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

  .state('initCompany', {
    url: '/init-company',
    parent: 'layout',
    resolve: {
      resolve: ['layout', 'Company', (l, C) => l.loadState({
        stateName: 'initCompany',
        models: [
          {name: 'company', model: C}
        ]
      })]
    },
    views: {
      content: {
        controller: ['$state', function($st) {
          this.formSuccess = () => $st.reload();
        }],

        controllerAs: 'vm',
        template: require('./templates/init-company.jade')()
      }
    }
  })

  .state('settings', {
    url: '/settings',
    parent: 'layout',
    resolve: {
      resolve: ['layout', (l) => l.loadState({
        stateName: 'settings'
      })]
    },
    views: {
      content: {
        template: '<p> settings section</p>'
      }
    }
  })

  .state('help', {
    url: '/help',
    parent: 'layout',
    resolve: {
      resolve: ['layout', (l) => l.loadState({
        stateName: 'help'
      })]
    },
    views: {
      content: {
        template: '<p> help section</p>'
      }
    }
  })

  .state('e404', {
    url: '/{failState:[a-zA-Z0-9-]+}',
    parent: 'layout',
    resolve: {
      resolve: ['layout', (l) => l.loadState({
        stateName: 'e404'
      })]
    },
    params: {
      failState: ''
    },
    views: {
      content: {
        template: require('./views/e404.jade')(),
        controllerAs: 'vm',
        controller: ['$state', function($st) {
          this.failState = $st.params.failState;
        }]
      }
    }
  });
}
