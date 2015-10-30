import * as dashboardRoutes from '../dashboard/dashboard.routes.js';
import * as layoutRoutes from '../layout/layout.routes.js';

import dashboardAM from '../dashboard/dashboard.js';
import layoutAM from '../layout/layout.js';

export const routes = angular.module('routes', [
    'ui.router',
    layoutAM.name,
    dashboardAM.name
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
  ($sP, $uRP, $lP) => {

    $lP.html5Mode({
      enabled: true,
      requiBase: true
    });

    dashboardRoutes.rules($uRP);
    dashboardRoutes.routes($sP);

    //loginRoutes.routes($sP);

    //-layout routes should be at end
    layoutRoutes.rules($uRP);
    layoutRoutes.routes($sP);

  }]);
