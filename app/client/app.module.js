import routesAM from './routes/routes.js';

(function(w, d) {

  const loadScript = (urlName) => {

    const script = d.createElement('script');

    script.src = urlName;
    script.async = true;

    d.getElementsByTagName('script')[
      d.getElementsByTagName('script').length - 1
    ].parentNode
      .insertBefore(
        script,
        d.getElementsByTagName('script')[
          d.getElementsByTagName('script').length
        ]
      );

  };

  const lang = (
    window.navigator.language || window.navigator.languages[0] || 'en'
  ).toLowerCase();

  const langParse = lang.slice(0,
    lang.indexOf('-') !== -1 ? lang.indexOf('-') : lang.length);

  const gmapUrl = 'https://maps.googleapis.com/maps/api/js?' +
    'key=AIzaSyCbHybZq8U8DrhCEW_phaTt1BEzJdvKCHo&region=PE?' +
    'language=' + langParse;

  loadScript(gmapUrl);

})(window, window.document);

export default angular.module('app', [routesAM.name])

  .config(['$logProvider', 'appConfigProvider', 'gmapProvider',
  ($lP, appCP, gmP) => {

    gmP.setDefaultCoordinates({lat: -6.776864, lng: -79.843937});
    $lP.debugEnabled(true);
    appCP.setName('consama');

  }])
  .controller('rootController', ['$rootScope', function($rS) {
    $rS.initialize = false;
  }]);

