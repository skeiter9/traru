'use strict';

module.exports = angular
  .module('componentsSidenavContent', [])
  /*
  .directive('fixOverlay', ['layoutFactory', '$mdSidenav', '$document',
    '$timeout', [(lF, $mdS, $d, $ti) => {
      return {
        link(s, elem, attrs) {

          let t1;

          //s.$watch(() => $mdS('left').isOpen(), () => appearSidenav(tog, 'left'));
          s.$watch(() => $mdS('right').isOpen(),
            (toggle) => appearSidenav(toggle, 'right'));

          function appearSidenav(toggle, idS) {

            if (toggle) t1 = $ti(() => {
              let overlay = $d[0].body.querySelector('.md-sidenav-backdrop');
              angular.element(overlay).on('click', (e) => {
                lF.sidenavAction('right', false);

                //e.stopPropagation();
              });
            }, 0);

          }

          s.$on('$destroy', () => {
            if (t1) $ti.cancel(t1);
          });

        }
      };
    }]])
  */
  .directive('mdxSidenavContent', ['$compile', '$timeout', '$animate',
    ($c, $t, $a) => {

      return {
        scope: {
          content: '='
        },
        restrict: 'A',
        link: (s, elem, attrs) => {

          const reload = () => {

            if (!angular.isObject(s.content)) s.content = {};

            const content = $c(angular.element(s.content.html || '<br/>'))
              (s.content.scope || s);

            //content.addClass('fx-fade-down fx-speed-300');
            //let toolbar = elem.parent().find('md-toolbar').eq(0);
            $t(() => {
              let prevContent = elem.children();
              prevContent.remove();
              elem.append(content);

              //prevContent.removeClass('fx-fade-down');
              //prevContent.addClass('fx-fade-right');
              //$a.leave(prevContent)
              //  .then(() => $a.enter(content, elem));
            }, 0);

          };

          const uppateContent = s.$watch('content', reload);

          s.$on('$destroy', () => uppateContent());

        }
      };

    }]);
