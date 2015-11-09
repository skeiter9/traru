'use strict';

require('./styles/dashboard.css');

import dashboardControllerFn from './dashboard.controller.js';
import layoutAM from '../layout/layout.js';

module.exports = angular
  .module('appDashboard', [
    layoutAM.name

    //require('../components/masonry.directive').name,
    //require('../components/module-card.directive').name,
    //require('../components/module-toolbar.directive').name
  ])
  .controller('DashboardController', dashboardControllerFn);
