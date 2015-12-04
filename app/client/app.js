import app from './app.module.js';

(function(w, d) {

  w.addEventListener('load', () => {

    return angular.bootstrap(w.document, [app.name], {strictDi: true});

  });

})(window, window.document);
