import routesAM from './routes/routes.js';

{
  const script = document.createElement('script');
  const lang = (
    window.navigator.language || window.navigator.languages[0] || 'en'
  ).toLowerCase();
  const langParse = lang.slice(0,
    lang.indexOf('-') !== -1 ? lang.indexOf('-') : lang.length);
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCbHybZq8U8DrhCEW_phaTt1BEzJdvKCHo&region=PE?language=' + langParse;
  script.async = true;

  document.getElementsByTagName('script')[document.getElementsByTagName('script').length - 1].parentNode
    .insertBefore(script, document.getElementsByTagName('script')[document.getElementsByTagName('script').length]);
}

export default angular.module('app', [routesAM.name])
  .config(['$logProvider', 'appConfigProvider', 'gmapProvider',
  ($lP, appCP, gmP) => {
    gmP.setDefaultCoordinates({lat: -6.776864, lng: -79.843937});
    $lP.debugEnabled(true);
    appCP.setName('consama');
  }]);
