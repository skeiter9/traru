import vergeAM from '../verge.factory';
import styles from './google-map.css';

export default angular
  .module('gmap', [

    //require('./platform-environment.factory').name,
    vergeAM.name,
    'ngMaterial'
  ])
  .factory('utils', ['$document', ($d) => {
    return {
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
    };
  }])
  .config(['$provide', ($p) => {

    $p.provider('gmap', function() {
      let defaultCoordinates = {lat: -12.043423, lng: -77.042611};

      const validCoordinates = (coordinates) => {
        return angular.isObject(coordinates) &&
          angular.isNumber(coordinates.lat) &&
          angular.isNumber(coordinates.lng) ?
            true : false;
      };

      this.setDefaultCoordinates = (v) => {
        defaultCoordinates = validCoordinates(v) ? v : defaultCoordinates;
      };

      this.$get = ['$log', '$mdDialog', '$rootScope', function($l, $mdD, $rS) {

        return {
          defaultCoordinates: defaultCoordinates,
          launchMap({
            event: e,
            geoposition: geoposition,
            title: title,
            theme: theme = 'default',
            standalone: standalone = false,
            fromInput: fromInput = false,
            showMarker: showMarker = true,
            icon: icon = false,
            inDialog: inDialog = false
          }) {
            return $mdD.show({
              targetEvent: e,

              template: require('./google-map-dialog.jade')(),
              controller: ['utils', '$document', function(u, $d) {
                this.isIntoFullScreen = u.isIntoFullScreen();
                this.close = () => $mdD.cancel();
                this.fullscreen = () => {
                  u.toggleFullScreen($d[0].querySelector('md-dialog'));
                  this.isIntoFullScreen = u.isIntoFullScreen();
                  $rS.$broadcast('gmapIsIntoFullScreen', u.isIntoFullScreen());
                };
              }],

              controllerAs: 'gmapDialog',
              bindToController: true,
              clickOutsideToClose: true,
              locals: {
                geoposition: geoposition,
                theme: theme,
                standalone: standalone,
                title: title,
                fromInput: fromInput,
                showMarker: showMarker,
                icon: icon,
                inDialog: inDialog
              }
            });

          },

          validCoordinates({coordinates, defaultPossible = false}) {
            return validCoordinates(coordinates) ? coordinates :
                defaultPossible ?
                  this.defaultCoordinates : (() => {
                    $l.warn('the coordinates entered are incorrect');
                    return false;
                  })();
          }
        };
      }];
    });

  }])
  .value('google', window.google)
  .directive('gmap', ['google', 'gmap', 'verge', (g, gm, v) => {
    return {
      restrict: 'E',
      scope: {
        geoposition: '=',
        showMarker: '=',
        inDialog: '='
      },
      bindToController: true,
      controller: angular.noop,
      controllerAs: 'gmap',
      link(s, elem, attrs, gmap) {
        if (!!!gm.validCoordinates({coordinates: gmap.geoposition})) return;

        const getHGmap = (xElem, xAttrs, inDialog, inFullScreen = false) => {
          return inFullScreen ?
            v.viewportH() - (v.viewportH() > 600 ? 64 : 56) : inDialog ?
            v.viewportH() * 0.45 : xElem[0].offsetWidth * (9 / 16);
        };

        elem.addClass(styles.gmap);
        elem.css({height: `${getHGmap(elem, attrs, gmap.inDialog)}px`});

        const map = new google.maps.Map(
          elem[0], {
          center: gmap.geoposition,
          zoom: parseInt(attrs.gmZoom) || 14,
          draggable: angular.isDefined(attrs.gmNoDraggable) ? false : true,
          scrollwheel: angular.isDefined(attrs.gmNoZoomScrollwheel) ?
            false : true,
          zoomControl: angular.isDefined(attrs.gmNoZoomControl) ?
            false : true,
          disableDefaultUI: angular
            .isDefined(attrs.gmDisableDefaultUI) || false
        });

        let marker = new google.maps.Marker({
          position: gmap.geoposition,
          opacity: gmap.showMarker ? 1 : 0,
          animation: google.maps.Animation.DROP,
          map: map,
          draggable: angular.isDefined(attrs.fromInput) ? true : false

          //place: google.maps.Place,
          //[angular.isDefined(attrs.icon) ? 'icon' : 'nn']: pIcon(attrs.icon),
        });

        const loadMap = google.maps.event.addListenerOnce(map, 'idle', () => {
          //console.log('idle map');
        });

        s.$on('gmapIsIntoFullScreen', (e, isIntoFullScreen) => {
          elem.css({height: `${getHGmap(elem, attrs, gmap.inDialog, isIntoFullScreen)}px`});
          setTimeout(() => {
            elem.css({height: `${getHGmap(elem, attrs, gmap.inDialog, isIntoFullScreen)}px`});
            s.$apply(() => map.setCenter(gmap.geoposition));
          }, 500);

        });

        s.$on('$destroy', () => {
          google.maps.event.removeListener(loadMap);
        });

      }
    };
  }]);
/*
.controller('gmapGeolocationController', ['google', '$mdDialog', '$mdToast',
  '$window', '$translate', '$rootScope', '$log', '$document',
    gmapGeolocationControllerFn])
.controller('gmapUtilsController', ['$mdDialog', 'gmapUtilsFactory',
  gmapUtilsControllerFn])
.directive('gmap', ['google', 'yeVerge', '$window', '$$rAF', '$log',
  '$animate', '$mdToast', '$document', '$q', '$timeout', gmapDirectiveFn])
.directive('gmapGeolocation', ['yePlatform', '$mdDialog', 'google',
  '$timeout', gmapGeolocationDirectiveFn]);

function gmapGeolocationControllerFn(g, $mdD, $mdT, $w, $t, $rS, $l, $d) {

  let gmap = this;

  let toggleFullScreen = (elem) => {

    let doc = window.document;
    let docEl = elem || doc.documentElement;

    let requestFullScreen = docEl.requestFullscreen ||
      docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen ||
      docEl.msRequestFullscreen;

    let cancelFullScreen = doc.exitFullscreen || doc.mozCancelFullScreen ||
      doc.webkitExitFullscreen || doc.msExitFullscreen;

    if (!doc.fullscreenElement && !doc.mozFullScreenElement &&
      !doc.webkitFullscreenElement && !doc.msFullscreenElement) {
      requestFullScreen.call(docEl);
    }else cancelFullScreen.call(doc);

  };

  let isIntoFullScreen = () => !(!$d[0].fullscreenElement &&
    !$d[0].mozFullScreenElement && !$d[0].webkitFullscreenElement &&
    !$d[0].msFullscreenElement);

  gmap.iconFullScreen = 'fullscreen' + (isIntoFullScreen() ? '-exit' : '');

  gmap.theme = angular.isDefined(gmap.theme) && gmap.theme !== '' ?
    gmap.theme : 'default';

  gmap.geolocate = () => {

    if (
      angular.isUndefined($w.navigator.geolocation)
    ) return errGeolocation('SENTENCES.NO_SUPPORT_GEOLOCATION');

    $w.navigator.geolocation.getCurrentPosition((position) => {
      $rS.$broadcast('geolocation', {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    }, (err) => {
      $l.error(err);
      errGeolocation('SENTENCES.CANNOT_GEOLOCATED');
    });

  };

  gmap.save = (v) => $mdD.hide(v);

  gmap.cancel = () => $mdD.cancel();
  gmap.close = () => $mdD.cancel();
  gmap.fullscreen = () => {
    toggleFullScreen($d[0].querySelector('md-dialog'));
    gmap.iconFullScreen = 'fullscreen' + (isIntoFullScreen() ? '-exit' : '');
  };

  function errGeolocation(i18n) {
    return $t(i18n).then((t) => $mdT.showSimple(t));
  }

}

function gmapUtilsControllerFn($mdDialog, gmapUF) {

  let gmUtils = this;

  gmUtils.validCoordinates = (ngModel, setDefault) => {
    return angular.isObject(ngModel) &&
      angular.isNumber(ngModel.lat) &&
      angular.isNumber(ngModel.lng) ?
      ngModel :
      setDefault ? {lat: -6.48454, lng: -76.3698509} : false;
  };

  gmUtils.launchDialogWgm = gmapUF.launchMap;

}

function gmapDirectiveFn(google, yeVerge, $w, $$rAF, $log, $animate, $mdT, $d, $q, $t) {

  return {
    scope: {
      ngModel: '='
    },
    template: require('./templates/gmap.jade')(),
    controller: 'gmapUtilsController',
    restrict: 'E',
    compile(tElement, tAttrs) {

      return (s, elem, attrs, ctrl) => {

        let initialized = false;
        let fullscreenMode = false;
        s.gmap = {};
        let gmap = s.gmap;
        gmap.iconFullScreen = 'fullscreen';

        let formateCoordinate = (ngModel, xAttrs) => {
          let res = false;
          try {

            if (
              angular.isUndefined(google)
            ) throw new Error(`google maps is not loaded`);

            if (ngModel instanceof google.maps.LatLng) return ngModel;

            if (
              ngModel.lat && ngModel.lng
            ) res = new google.maps.LatLng(ngModel.lat, ngModel.lng);
            else if (
              parseInt(xAttrs.gmLat) && parseInt(xAttrs.gmLng)
            ) res = new google.maps.LatLng(xAttrs.gmLat, xAttrs.gmLng);
            else throw new Error(
              `please set coordinates for the map`
            );

          } catch (e) {
            $log.warn(e);
            res = false;
          }

          return res;
        };

        let getHGmap = (xElem, xAttrs, inFullScreen = false) => {
          return inFullScreen ?
            yeVerge.viewportH() - 64 : angular.isDefined(xAttrs.inDialog) ?
            yeVerge.viewportH() * 0.45 : xElem[0].offsetWidth * (9 / 16);
        };

        let isIntoFullScreen = (xAttrs) => !(!$d[0].fullscreenElement &&
          !$d[0].mozFullScreenElement && !$d[0].webkitFullscreenElement &&
          !$d[0].msFullscreenElement) && angular.isDefined(xAttrs.inDialog);

        let init = (xElem, xAttrs) => {

          fullscreenMode = isIntoFullScreen(xAttrs);
          let heightMap = getHGmap(xElem, xAttrs, fullscreenMode);

          angular.element(xElem[0].querySelector('.gmap__map'))
            .css({height: heightMap + 'px'});

          angular.element(xElem[0].querySelector('.gmap__map__wrapper'))
            .css({height: heightMap + 'px'});

          if (angular.isDefined(google)) return true;
          else {
            let gmapMapPoster = xElem[0].querySelector('.gmap__map__poster');
            gmapMapPoster.classList.add('fail');
            let icon = $d[0].createElement('span');
            icon.classList.add('mdi', 'mdi-alert-circle');
            gmapMapPoster.appendChild(icon);
            return false;
          }

        };

        let resize = (xElem, xAttrs, xMap, xCenterCordinates) => {
          init(xElem, xAttrs);
          if (
            angular.isDefined(xMap) &&
            xMap instanceof google.maps.Map &&
            xCenterCordinates instanceof google.maps.LatLng
          ) {
            google.maps.event.trigger(xMap, 'resize');
          }
        };

        let centerCoordinates = formateCoordinate(s.ngModel, attrs);

        if (!init(elem, attrs, false, centerCoordinates)) {
          $log.warn('google maps api can\'t fetch');
          return angular.noop;
        }

        let pIcon = (fontIconName) => {
          let res = 'assets/';
          if (fontIconName === 'empresa') res += 'factory';
          else res += 'star';
          res += '.svg';
          return res;
        };

        if (centerCoordinates === false) return;

        let map = new google.maps.Map(
          elem[0].querySelector('.gmap__map__wrapper'), {
          center: centerCoordinates,
          zoom: parseInt(attrs.gmZoom) || 14,
          draggable: angular.isDefined(attrs.gmNoDraggable) ? false : true,
          scrollwheel: angular.isDefined(attrs.gmNoZoomControl) ?
            false : true,
          zoomControl: angular.isDefined(attrs.gmNoZoomControl) ?
            false : true,
          disableDefaultUI: angular
            .isDefined(attrs.gmDisableDefaultUI) || false
        });

        let marker = new google.maps.Marker({
          position: centerCoordinates,
          animation: google.maps.Animation.DROP,
          map: map,
          place: google.maps.Place,
          draggable: angular.isDefined(attrs.fromInput) ? true : false,

          //[angular.isDefined(attrs.icon) ? 'icon' : 'nn']: pIcon(attrs.icon),
          opacity: angular.isDefined(attrs.gmShowMarker) ||
            angular.isDefined(attrs.route) ? 1 : 0
        });

        let directionsService = angular.isDefined(attrs.route) ?
          new google.maps.DirectionsService() : false;

        let directionsDisplay = angular.isDefined(attrs.route) ?
          new google.maps.DirectionsRenderer({
            draggable: true,
            map: map
          }) : false;

        let maximize = (e) => ctrl.launchDialogWgm(
          e, s.ngModel, attrs.theme, true, attrs.gmTitle
        );

        let setPanel = (dSResponse) => {
          console.log(dSResponse);
          gmap.showPanel = true;
          gmap.panelData = dSResponse.routes[0].legs[0];
        };

        let sUbication = (e) => {

          if (
            marker &&
            marker.getOpacity() === 0 &&
            angular.isUndefined(attrs.route)
          ) marker.setOpacity(1);

          if (
            angular.isDefined(attrs.fromInput) &&
            angular.isUndefined(attrs.route)
          ) marker.setPosition(e.latLng);

          if (angular.isDefined(attrs.route)) {

            if (
              marker &&
              marker.getOpacity() === 1
            ) marker.setOpacity(0);

            directionsService.route({
              origin: marker.getPosition(),
              destination: e.latLng,
              travelMode: google.maps.TravelMode.DRIVING,
              unitSystem: google.maps.UnitSystem.METRIC
            }, (response, status) => {
              //console.log(response);
              if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);

                //setPanel(response);
              } else $log.warn('Directions request failed due to ' + status);
            });

          }else {
            map.panTo(e.latLng);
            s.ngModel = {lat: e.latLng.lat(), lng: e.latLng.lng()};
          }

        };

        let loadEvent = google.maps.event
          .addListenerOnce(map, 'idle', () => {
            let gmapMap = elem.children('div').eq(0);
            let poster = gmapMap.find('div').eq(0);
            let mapWrapper = gmapMap.find('div').eq(1);

            $animate.addClass(poster, 'ye-fade');
            $animate.addClass(mapWrapper, 'ye-appear');

          });

        let clickMap = google.maps.event.addListener(map, 'click',
          angular.isUndefined(attrs.gmStandalone) ?
            sUbication : angular.noop);

        let directionsDisplayChange = directionsDisplay !== false ?
          directionsDisplay.addListener('directions_changed', () => {
            s.$apply(() => {
              setPanel(directionsDisplay.getDirections());
            });
          }) : false;

        let dragendMarker = google.maps.event.addListener(marker,
            angular.isDefined(attrs.fromInput) ? 'dragend' : 'click',
            angular.isDefined(attrs.inDialog) &&
            angular.isDefined(attrs.fromInput) ? sUbication :
            angular.isUndefined(attrs.inDialog) ? maximize : angular.noop);

        $w.addEventListener('resize', $$rAF.throttle(resize.bind(null,
          elem, attrs, map, centerCoordinates)));

        let resizeMap = google.maps.event.addListener(map, 'resize', (e) => {
          map.setCenter(centerCoordinates);
        });

        s.$on('geolocation', (e, sCoords) => {
          e.latLng = new google.maps.LatLng(sCoords.lat, sCoords.lng);
          sUbication(e);
        });

        s.$on('$destroy', function() {

          google.maps.event.removeListener(loadEvent);
          google.maps.event.removeListener(loadEvent);
          google.maps.event.removeListener(clickMap);
          google.maps.event.removeListener(dragendMarker);

        });

      };

    }
  };

}

function gmapGeolocationDirectiveFn(yePlatform, $mdDialog, google, $t) {

  return {
    scope: {
      ngModelGeo: '=',
      ngModel: '='
    },
    controller: 'gmapUtilsController',
    link(s, elem, attrs, gmUtils) {

      if (angular.isUndefined(google)) return;

      let t1 = $t(() => {

        let coordinateInitial = gmUtils.validCoordinates(s.ngModelGeo) ?
          new google.maps.LatLng(s.ngModelGeo.lat, s.ngModelGeo.lng) : false;

        s.ngModel = coordinateInitial instanceof google.maps.LatLng ?
          coordinateInitial.toString() : '';

        elem.on(yePlatform.isTouchScreen ? 'touchstart' : 'click', (evt) => {

          let coordinates = gmUtils.validCoordinates(s.ngModelGeo, true);

          gmUtils.launchDialogWgm(evt, coordinates, attrs.theme, false, '',
            angular.isDefined(s.ngModelGeo) ? 2 : 1)

            .then((value) => {

              s.ngModelGeo = value;
              s.ngModel = value ? `${value.lat}, ${value.lng}` : '';

            });

        });

      }, 0);

      s.$on('$destroy', () => {
        $t.cancel(t1);
      });

    }
  };

}
*/
