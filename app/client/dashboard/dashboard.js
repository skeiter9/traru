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

  .controller('DashboardController', ['layout', '$state', function(l, $st) {

    this.moduleTruck = l.dataUser.modules.truck;
    this.moduleCompany = l.dataUser.modules.company;
    this.moduleRoute = l.dataUser.modules.route;
    this.moduleClient = l.dataUser.modules.client;
    this.moduleWorker = l.dataUser.modules.worker;

    if ($st.current.name.indexOf('.') === -1) l.loadStateEnd();

  }]);

