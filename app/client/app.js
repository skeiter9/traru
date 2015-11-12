import app from './app.module.js';

{

  window.addEventListener('load', () => {
    return angular.bootstrap(window.document, [app.name], {strictDi: true});
  });

}
