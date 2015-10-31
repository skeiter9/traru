//import angular from 'angular';
import {routes} from './routes/routes.js';

export const app = angular.module('app', [routes.name])
  .factory('Person', function() {
    return function Person(name) {
      this.name = name;
    };
  });
