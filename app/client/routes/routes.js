import * as dashboardRoutes from '../dashboard/dashboard.routes.js';
import * as loginRoutes from '../login/login.routes.js';
import * as layoutRoutes from '../layout/layout.routes.js';
import * as trucksRoutes from '../truck/truck.routes.js';

import dashboardAM from '../dashboard/dashboard.js';
import loginAM from '../login/login.js';

export default angular.module('routes', [
    'ui.router',
    dashboardAM.name,
    loginAM.name
  ])

  .config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
  ($sP, $uRP, $lP) => {

    $lP.html5Mode({
      enabled: true,
      requiBase: true
    });

    trucksRoutes.rules($uRP);
    trucksRoutes.routes($sP);

    dashboardRoutes.rules($uRP);
    dashboardRoutes.routes($sP);

    loginRoutes.rules($uRP);
    loginRoutes.routes($sP);

    //-layout routes should be at end
    layoutRoutes.rules($uRP);
    layoutRoutes.routes($sP);

  }]);
