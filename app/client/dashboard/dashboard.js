require('./styles/dashboard.css');

import dashboardControllerFn from './dashboard.controller.js';
import layoutAM from '../layout/layout.js';
import apiAM from '../api/api.js';
import truckAM from '../truck/truck.js';

module.exports = angular
  .module('dashboard', [
    layoutAM.name,
    apiAM.name,
    truckAM.name
  ])
  .controller('DashboardController', dashboardControllerFn);
