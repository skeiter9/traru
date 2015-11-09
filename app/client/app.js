//import angular from 'angular';

import {app} from './app.module.js';

(function(w) {

  /**
   * main function
   */
  const load = () => {
    return angular.bootstrap(w.document, [app.name], {strictDi: true});
  };

  w.addEventListener('load', load);

})(window);
