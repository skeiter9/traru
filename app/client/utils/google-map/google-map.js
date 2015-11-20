import vergeAM from '../verge.factory';
import styles from './google-map.css';

export default angular
  .module('gmap', [
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
            inDialog: inDialog = true,
            geolocable: geolocable = false
          }) {
            return $mdD.show({
              targetEvent: e,
              template: require('./google-map-dialog.jade')(),
              controller: ['utils', '$document', function(u, $d) {
                this.isIntoFullScreen = u.isIntoFullScreen();
                this.close = () => $mdD.cancel();
                this.save = (geo, geoText) => $mdD.hide([geo, geoText]);
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
                inDialog: inDialog,
                geolocable: geolocable
              }
            });

          },

          validCoordinates({coordinates, defaultPossible = false}) {
            return validCoordinates(coordinates) ? coordinates :
                defaultPossible ?
                  this.defaultCoordinates :
                  (() => {
                    $l.warn('the coordinates entered are incorrect');
                    return false;
                  })();
          }
        };
      }];
    });

  }])
  .value('google', window.google)

  .directive('gmap', ['google', 'gmap', 'verge', '$window', (g, gm, v, $w) => {
    return {
      restrict: 'E',
      scope: {
        geoposition: '=',
        geopositionText: '=',
        showMarker: '=',
        inDialog: '=',
        gmapGeolocable: '='
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

        const geocoder = new google.maps.Geocoder();

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

        const marker = new google.maps.Marker({
          position: gmap.geoposition,
          opacity: gmap.showMarker ? 1 : 0,
          animation: google.maps.Animation.DROP,
          map: map,
          draggable: angular.isDefined(attrs.fromInput) ? true : false

          //place: google.maps.Place,
          //[angular.isDefined(attrs.icon) ? 'icon' : 'nn']: pIcon(attrs.icon),
        });

        const clickM = google.maps.event.addListener(map, 'click', (e) => {
          map.panTo(e.latLng);
          if (gmap.gmapGeolocable) {
            marker.setOpacity(1);
            marker.setPosition(e.latLng);
            gmap.geoposition = {lat: e.latLng.lat(), lng: e.latLng.lng()};

            geocoder.geocode({location: e.latLng}, (result, status) => {
              if (status === google.maps.GeocoderStatus.OK) {
                s.$apply(() => {
                  // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                  gmap.geopositionText = result[0].formatted_address;

                  // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
                });
              } else {
                console.warn(status, result);
              }
            });
          }

        });

        const resizeM = google.maps.event.addListener(map, 'resize', () => {
          map.panTo(gmap.geoposition);
        });

        s.$on('gmapIsIntoFullScreen', (e, isIntoFullScreen) => {
          elem.css({height: `${getHGmap(elem, attrs, gmap.inDialog, isIntoFullScreen)}px`});
          setTimeout(() => {
            elem.css({height: `${getHGmap(elem, attrs, gmap.inDialog, isIntoFullScreen)}px`});
            s.$apply(() => map.setCenter(gmap.geoposition));
          }, 500);

        });

        $w.addEventListener('optimizedResize', (e) => {
          google.maps.event.trigger(map, 'resize');
        });

        s.$on('$destroy', () => {
          google.maps.event.removeListener(clickM);
          google.maps.event.removeListener(resizeM);
        });

      }
    };
  }])

  .directive('gmapGeolocation', ['google', 'gmap', '$timeout', (g, gm, $t) => {
    return {
      restrict: 'A',
      scope: {
        ngModel: '=',
        ngModelGeo: '=',
        title: '@'
      },
      template: ``,
      link(s, elem, attrs) {

        let initialized = false;

        const t1 = $t(() => {
          if (!!!s.ngModelGeo && !initialized) {
            initialized = true;
            return;
          }

          const geocoder = new google.maps.Geocoder();
          geocoder.geocode({location: s.ngModelGeo}, (result, status) => {
            if (status === google.maps.GeocoderStatus.OK) {
              s.$apply(() => {
                // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                s.ngModel = result[0].formatted_address;

                // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
              });
            } else {
              console.warn(status, result);
            }
          });

        }, 0);

        const actionTouch = (e) => {
          e.preventDefault();
          e.stopPropagation();

          const ubi = s.ngModelGeo;

          return gm.launchMap({
            event: e,
            geolocable: true,
            geoposition: gm.validCoordinates({
              coordinates: ubi, defaultPossible: true
            }),
            title: !!s.title ?
              s.title :
              'ACTIONS.PICK_UBICATION',
            showMarker: angular.isObject(ubi) && !!ubi.lat && !!ubi.lng
          })
            .then(res => {
              s.ngModelGeo = res[0];
              s.ngModel = res[1];
            })
            .catch((err) => {
              s.ngModel = !!s.ngModel ? s.ngModel : '';
            });
        };

        elem.on('touchstart', actionTouch);
        elem.on('click', actionTouch);

        s.$on('$destroy', () => {
          $t.cancel(t1);
        });
      }
    };
  }])

  .directive('geoText', ['google', 'gmap', '$timeout', (g, gm, $t) => {
    return {
      restrict: 'A',
      scope: {
        geopoint: '=geoText'
      },
      link(s, elem) {
        //const t1 = $t(()=> {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({location: s.geopoint}, (result, status) => {
          if (status === google.maps.GeocoderStatus.OK) {
            // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
            elem.text(result[0].formatted_address);

            // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
          } else {
            console.warn(status, result);
            elem.text('err');
          }
        });

        //});
      }
    };
  }]);
