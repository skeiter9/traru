import app from './app.module.js';

{

  window.addEventListener('load', () => {
    const mainTag = document.createElement('main');
    mainTag.setAttribute('ui-view', '');
    document.body.insertBefore(mainTag, document.getElementsByTagName('script')[document.getElementsByTagName('script').length - 3]);
    return angular.bootstrap(window.document, [app.name], {strictDi: true});
  });

}
