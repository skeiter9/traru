export default angular
  .module('traruUtils', [])

  .factory('utils', ['$document', ($d) => ({

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
