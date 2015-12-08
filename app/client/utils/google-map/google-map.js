import vergeAM from '../verge.factory';
import styles from './google-map.css';
import utilsAM from '../utils.factory.js';

export default angular
  .module('gmap', [
    vergeAM.name,
    utilsAM.name,
    'ngMaterial'
  ])

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

      this.$get = ['$log', '$mdDialog', '$rootScope', 'verge',
      ($l, $mdD, $rS, v) => {

        return {
          defaultCoordinates: defaultCoordinates,
          getHGmap(xElem, xAttrs, inDialog = false, inFullScreen = false) {
            return inFullScreen ?
                v.viewportH() - (v.viewportH() > 600 ? 64 : 56) :
              inDialog ?
                v.viewportH() * 0.45 :
                xElem[0].offsetWidth * (9 / 16);
          },

          launchMap({
            e,
            geoposition,
            title = 'ACTIONS.PICK_UBICATION',
            theme = 'default',
            standalone = false,
            fromInput = false,
            showMarker = true,
            icon = false,
            inDialog = true,
            geolocable = false,
            closeFn = angular.noop
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
                title:   angular.isDefined(title) && !!title &&
                  title !== 'undefined' ?
                    title :
                    'ACTIONS.PICK_UBICATION',
                fromInput: fromInput,
                showMarker: showMarker,
                icon: icon,
                inDialog: inDialog,
                geolocable: geolocable
              }
            });

          },

          validCoordinates({coordinates, defaultPossible = false, field = ''}) {
            return validCoordinates(coordinates) ? coordinates :
                defaultPossible ?
                  this.defaultCoordinates :
                  (() => {
                    $l.debug('the coordinates are incorrect ' + field);
                    return false;
                  })();
          }
        };
      }];
    });

  }])
  .value('google', window.google)

  .directive('gmap', ['google', 'gmap', 'verge', '$window', '$timeout',
  (g, gm, v, $w, $t) => {
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

        elem.addClass(styles.gmap);
        elem.css({height: `${gm.getHGmap(elem, attrs, gmap.inDialog)}px`});

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

        s.$on('gmapIsIntoFullScreen', (e, isIntoFullScreen) => {
          elem.css({height: `${gm.getHGmap(elem, attrs, gmap.inDialog, isIntoFullScreen)}px`});
          $t(() => {
            elem.css({height: `${gm.getHGmap(elem, attrs, gmap.inDialog,
              isIntoFullScreen)}px`});
            map.setCenter(gmap.geoposition);
          }, 0);

        });

        const resizeM = google.maps.event.addListener(map, 'resize', () => {
          map.panTo(gmap.geoposition);
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

  .directive('gmapRoute', ['google', 'gmap', '$timeout', '$log', 'async',
  '$window',
  (g, gm, $t, $l, async, $w) => ({
    restrict: 'E',
    scope: {
      geopointInitial: '=',
      geopointFinal: '=',
      waypoints: '='
    },
    bindToController: true,
    controllerAs: 'gmRoute',
    controller:angular.noop,
    template: require('./google-map-route.jade')(),
    link(s, elem, attrs, gmRoute) {

      let map;
      let directionsDisplay;
      let mapNode;

      elem.addClass(styles.gmap);

      let t2;
      const t1 = $t(() => {
        t2 = $t(() => {

          mapNode = elem[0].querySelector('.map');
          mapNode.style.height = `${gm.getHGmap(elem, attrs)}px`;
          console.log(gm.getHGmap(elem, attrs));

          map = new google.maps.Map(
            mapNode, {
            center: gm.defaultCoordinates,
            zoom: 14,
            scrollwheel: false
          });

          directionsDisplay = new google.maps.DirectionsRenderer({map: map});

          const changeDirections = google.maps.event.addListener(
          directionsDisplay, 'directions_changed', () => {
            const newDirections = directionsDisplay.getDirections();
            const newPoints = newDirections.routes[0].legs[0];
            console.log(newDirections);
          });

        }, 0);
      }, 0);

      const directionsService =  new google.maps.DirectionsService();

      const setRoute = ({origin, destination}) => directionsService.route({
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
        unitSystem: google.maps.UnitSystem.METRIC,
        waypoints: gmRoute.waypoints,
        optimizeWaypoints: true
      }, (response, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
        } else $l.warn('Directions request failed due to ' + status);
      });

      //const resizeM = google.maps.event.addListener(map, 'resize', () => {
      //  map.panTo(gmap.geoposition);
      //});

      $w.addEventListener('optimizedResize', (e) => {
        //google.maps.event.trigger(map, 'resize');
        mapNode.style.height = `${gm.getHGmap(elem, attrs)}px`;
        console.log(gm.getHGmap(elem, attrs));
      });

      const wPG = s.$watchGroup([
        () => gmRoute.geopointInitial, () => gmRoute.geopointFinal
      ],
      (nVs, oVs) => {
        if (
          !gm.validCoordinates({coordinates: nVs[0]}) ||
          !gm.validCoordinates({coordinates: nVs[1]})
        ) return;
        setRoute({origin: nVs[0], destination: nVs[1]});
      });

      const wWPs = s.$watchCollection(() => gmRoute.waypoints, (nV, oV) => {
        if (nV.length === 0) return;
        else if (
          !gm.validCoordinates({coordinates: gmRoute.geopointInitial}) ||
          !gm.validCoordinates({coordinates: gmRoute.geopointFinal})
        ) return;

        async.each(nV,
        (waypoint, cb) => {
          if (!angular.isObject(waypoint)) cb(new Error('no waypoint'));
          else if (!gm.validCoordinates({coordinates: waypoint.location})
          ) cb(new Error('waypoint location is incorrect'));
          else cb(null);
        },

        (err) => {
          if (!!!err) setRoute({
            origin: gmRoute.geopointInitial,
            destination: gmRoute.geopointFinal
          });
        });
      });

      s.$on('$destroy', () => {
        wPG();
        wWPs();
      });

    }
  })])

  .directive('gmapGeolocation', ['google', 'gmap', '$timeout', (g, gm, $t) => {
    return {
      restrict: 'A',
      scope: {
        ngModel: '=',
        ngModelGeo: '='
      },
      template: ``,
      link(s, elem, attrs) {

        const t1 = $t(() => {

          if (angular.isUndefined(attrs.waypoint) &&
            !gm.validCoordinates({coordinates: s.ngModelGeo})) {
            s.ngModel = '';
            return;
          }

          if (angular.isDefined(attrs.waypoint) &&
            !angular.isObject(s.ngModelGeo)) {
            s.ngModel = '';
            return;
          }

          if (angular.isDefined(attrs.waypoint) &&
            angular.isObject(s.ngModelGeo) &&
            !gm.validCoordinates({coordinates: s.ngModelGeo.location})) {
            s.ngModel = '';
            return;
          }

          const ubi = angular.extend({}, angular.isUndefined(attrs.waypoint) ?
            s.ngModelGeo : s.ngModelGeo.location);

          const geocoder = new google.maps.Geocoder();

          geocoder.geocode({
            location: ubi
          }, (result, status) => {
            if (status === google.maps.GeocoderStatus.OK) s.$apply(() => {
              // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
              s.ngModel = result[0].formatted_address;

              // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
            });
            else $l.debug.warn(status, result);
          });

        }, 0);

        const actionTouch = (e) => {
          e.preventDefault();
          e.stopPropagation();

          if (angular.isDefined(attrs.waypoint) &&
            !angular.isObject(s.ngModelGeo)) s.ngModelGeo = {};

          const ubi = angular.extend({}, angular.isUndefined(attrs.waypoint) ?
            s.ngModelGeo : s.ngModelGeo.location);

          return gm.launchMap({
            event: e,
            theme: attrs.theme,
            title: attrs.title,
            geolocable: true,
            geoposition: gm.validCoordinates({
              coordinates: ubi,
              defaultPossible: true
            }),
            showMarker: gm.validCoordinates({coordinates: ubi})
          })
            .then(res => {
              if (angular.isUndefined(attrs.waypoint)) s.ngModelGeo = res[0];
              else s.ngModelGeo = {
                location: res[0],
                stopover: true
              };
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

  .directive('geoText', ['google', 'gmap', '$timeout', '$log',
  (g, gm, $t, $l) => {
    return {
      restrict: 'A',
      scope: {
        geopoint: '=geoText'
      },
      link(s, elem) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({location: s.geopoint}, (result, status) => {
          if (status === google.maps.GeocoderStatus.OK) {
            // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
            elem.text(result[0].formatted_address);

            // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
          } else {
            $l.debug(status, result);
            elem.text('err');
          }
        });

      }
    };
  }]);
