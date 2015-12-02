require('./styles/dashboard.css');

import layoutAM from '../layout/layout.js';
import apiAM from '../api/api.js';
import truckAM from '../truck/truck.js';
import routeAM from '../route/route.js';
import clientAM from '../client/client.js';
import workerAM from '../worker/worker.js';

module.exports = angular
  .module('dashboard', [
    layoutAM.name,
    apiAM.name,
    truckAM.name,
    routeAM.name,
    clientAM.name,
    workerAM.name
  ])
  .controller('DashboardController', ['$state', 'resolve',
  function($s, r) {

    this.moduleTruck = r.truck;
    this.moduleCompany = r.company;
    this.moduleRoute = r.route;
    this.moduleClient = r.client;
    this.moduleWorker = r.worker;

  }]);
