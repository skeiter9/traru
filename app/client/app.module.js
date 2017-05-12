import routesAM from './routes/routes.js';

export default angular.module('app', [routesAM.name])

  .config(['$logProvider', 'appConfigProvider', 'gmapProvider',
  ($lP, appCP, gmP) => {
    $lP.debugEnabled(true);
    gmP.setDefaultCoordinates({lat: -6.776864, lng: -79.843937});
    appCP.setName('Dipropan');
  }])

  .controller('rootController', ['$rootScope', function($rS) {
    $rS.initialize = false;
  }]);
