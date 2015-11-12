import routesAM from './routes/routes.js';

{
  const script = document.createElement('script');
  script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCbHybZq8U8DrhCEW_phaTt1BEzJdvKCHo&region=PE?language=es';
  script.async = true;

  document.getElementsByTagName('script')[document.getElementsByTagName('script').length - 1].parentNode
    .insertBefore(script, document.getElementsByTagName('script')[document.getElementsByTagName('script').length - 1]);
}

export default angular.module('app', [routesAM.name])
  .config(['$logProvider', ($lP) => {
    $lP.debugEnabled(true);
  }]);
