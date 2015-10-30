//import angular from 'angular';
import {routes} from './routes/routes.js';

export const app = angular.module('app', [routes.name])
  .config([function() {
    //console.log('config');
  }])
  .run(() => {
    //console.log('run');
  });
