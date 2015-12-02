import styles from './cover.directive.css';

export default angular
  .module('yeCover', [])
  .directive('yeCover', ['$window', '$http', '$animate', '$timeout',
  ($w, $h, $a, $t) => ({
    scope: {
      spinner: '=',
      actionFn: '&',
      actionIcon: '@'
    },
    require: '^^?mdSidenav',
    restrict: 'E',
    template: `
      <div
        class='content-spinner fx-fade-down fx-dur-3000 fx-ease-sine'
        layout
        layout-align='center center'
        ng-hide='spinnerStop'
      >
        <md-progress-circular md-mode="indeterminate"/>
      </div>

      <div
        class='cover_image' ng-style='photoImage'
        ng-class='!spinnerStop ? "ye-fade" : "ye-appear"'
      >
      </div>

      <md-button
        ng-if='actionIcon'
        ng-click='actionFn({evt: $event})'
        class='md-fab md-accent'
        aria-label='action {{actionIcon}}'
      >
        <md-icon md-font-icon="mdi mdi-{{actionIcon}}"/>
      </md-button>
    `,
    compile(tE, tA) {

      tE.attr('md-theme', tA.mdTheme || 'default');

      return (scope, element, attrs, mdSCtrl) => {

        scope.initialized = false;
        scope.spinnerStop = false;
        element.addClass(styles.cover);

        const wSidenav = () => {
          let s = 180;
          if (mdSCtrl && $w.innerWidth >= 360) s = 162.5625;
          else if (mdSCtrl && $w.innerWidth < 360
          ) s = ($w.innerWidth - 56) * (9 / 16);
          else if (element[0].offsetWidth > 0
          ) s = element[0].offsetWidth * (9 / 16);
          return s;
        };

        const resize = (fromResize = false) => {

          const t1 = $t(() => {
            element.css({height: wSidenav() + 'px'});
            $t.cancel(t1);
          }, 0);

          if (scope.initialized) return;

          if (
            angular.isDefined(attrs.bordered)
          ) element.addClass('br-1111 md-whiteframe-z1');
          else element.addClass('bb');

          if (/data:image/.test(attrs.picture)) {
            scope.$apply(() => {
              scope.initialized = !scope.initialized ? true : true;
              scope.spinnerStop = true;
              scope.photoImage = {
                'background-image': `url('${attrs.picture}')`
              };
            });
          }else if (/http/.test(attrs.picture)) $h({
              method: 'get',
              url: attrs.picture,
              cache: false,
              responseType: 'blob'
            })
              .then((res) => {
                let reader = new FileReader();
                reader.onload = () => {
                  scope.$apply(() => {
                    scope.initialized = !scope.initialized ?
                      true : true;
                    scope.photoImage = {
                      'background-image': `url('${reader.result}')`
                    };
                    scope.spinnerStop = true;
                  });
                };

                reader.readAsDataURL(res.data);
              })
              .catch((error) => {
                console.error(error);
              });
          else if (angular.isDefined(attrs.icon)) {
            scope.spinnerStop = true;
            if (!scope.initialized) {
              let icon = angular.element(
                `<span
                  class='mdi mdi-${attrs.icon !== '' ?
                    attrs.icon : 'checkbox-blank-circle'}'>
                </span>`
              );
              element.append(icon);
              $a.addClass(icon, 'ye-appear');
              scope.initialized = true;
            }
          }else {
            scope.spinnerStop = true;
            element.css({backgroundImage: `url(${attrs.picture})`});
          }
        };

        const watchPicture = attrs
          .$observe('picture', (pic) => resize(false));

        $w.addEventListener('optimizedResize',
          resize.bind(null, true));

        scope.$on('$destroy', (evt) => {
          watchPicture();
        });

      };
    }
  })]);
