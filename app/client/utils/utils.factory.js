export default angular
  .module('traruUtils', [])

  .factory('utils', ['$document', '$window', ($d, $w) => ({

    getLanguage(languages, prefLang = 'en') {
      const lang = $w.navigator.language || $w.navigator.languages[0];
      let index = languages.indexOf(lang.toLowerCase());
      if (index !== -1) return lang;
      const indexAux = lang.indexOf('-');
      const auxLanguage = (indexAux !== -1) ?
        lang.substring(0, indexAux) :
        lang.substring(0, lang.length);

      index = languages.indexOf(auxLanguage);
      if (index !== -1) return auxLanguage;
      return prefLang;
    },

    isIntoFullScreen() {
      return !(
        !$d[0].fullscreenElement &&
        !$d[0].mozFullScreenElement &&
        !$d[0].webkitFullscreenElement &&
        !$d[0].msFullscreenElement
      );
    },

    toggleFullScreen(elem = $d[0].documentElement) {

      const doc = $d[0];

      const requestFullScreen = elem.requestFullscreen ||
        elem.mozRequestFullScreen || elem.webkitRequestFullScreen ||
        elem.msRequestFullscreen;

      const cancelFullScreen = doc.exitFullscreen ||
        doc.mozCancelFullScreen || doc.webkitExitFullscreen ||
        doc.msExitFullscreen;

      if (!doc.fullscreenElement && !doc.mozFullScreenElement &&
        !doc.webkitFullscreenElement && !doc.msFullscreenElement
      ) requestFullScreen.call(elem);
      else cancelFullScreen.call(doc);

    }
  })]);
