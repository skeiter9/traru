import * as dashboardRoutes from '../dashboard/dashboard.routes.js';
import * as loginRoutes from '../login/login.routes.js';
import * as layoutRoutes from '../layout/layout.routes.js';

import layoutAM from '../layout/layout.js';
import dashboardAM from '../dashboard/dashboard.js';
import truckAM from '../truck/truck.js';

export const routes = angular.module('routes', [
    'ui.router',
    layoutAM.name,
    dashboardAM.name,
    truckAM.name
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
  ($sP, $uRP, $lP) => {

    $lP.html5Mode({
      enabled: true,
      requiBase: true
    });

    dashboardRoutes.rules($uRP);
    dashboardRoutes.routes($sP);

    loginRoutes.rules($uRP);
    loginRoutes.routes($sP);

    //-layout routes should be at end
    layoutRoutes.rules($uRP);
    layoutRoutes.routes($sP);

  }]);
