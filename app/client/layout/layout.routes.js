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
    auth: true,
    views: {
      content: {
        template: require('./templates/init-company.jade')(),
        controllerAs: 'vm',
        controller: ['$state', function($st) {
          this.formSuccess = () => {
            $st.reload();
            return;
          };
        }]
      }
    }
  })

  .state('settings', {
    url: '/settings',
    parent: 'layout',
    views: {
      content: {
        template: '<p> settings section</p>'
      }
    }
  })

  .state('noLoggued', {
    url: '/no-loggued',
    parent: 'layout',
    views: {
      content: {
        template: '<p> login please </p>'
      }
    }
  })

  .state('help', {
    url: '/help',
    parent: 'layout',
    views: {
      content: {
        template: require('./views/help.jade')()
      }
    }
  })

  .state('e404', {
    url: '/{failState:[a-zA-Z0-9-]+}',
    parent: 'layout',
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
