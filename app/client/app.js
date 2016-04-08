import app from './app.module.js';

(function(w, d) {

  w.addEventListener('load', () => {

    const loadScript = (urlName, fn) => {

      const script = d.createElement('script');

      script.addEventListener('load', function() {
        fn();
      });

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

    loadScript(gmapUrl, function() {
      angular.bootstrap(w.document, [app.name], {strictDi: true});
    });

  });

})(window, window.document);
