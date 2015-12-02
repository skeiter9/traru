export default angular.module('componentsSidenavContent', ['ngMaterial'])

  .directive('mdSelectBackdrop', ['$mdSidenav', '$document', ($mdS, $d) => ({
    restrict: 'C',
    link(s, elem) {
      $d[0].body.style.removeProperty('overflow');
    }
  })])

  .directive('mdSidenavBackdrop', ['$mdSidenav', '$document', ($mdS, $d) => ({
    restrict: 'C',
    link(s, elem, attrs) {

      const w1 = s.$watchGroup([
        () => $mdS('left').isOpen(),
        () => $mdS('right').isOpen()
      ],
      (nVs, oVs) => !nVs[0] && !nVs[1] ?
        $d[0].body.style.removeProperty('overflow') :
        $d[0].body.style.overflow = 'hidden'
      );

      s.$on('$destroy', () => w1());

    }
  })])

  .directive('mdxSidenavContent', ['$compile', '$timeout', '$animate',
    ($c, $t, $a) => ({
      scope: {
        content: '='
      },
      restrict: 'A',
      link: (s, elem, attrs) => {

        const uppateContent = s.$watch('content', () => {

          if (!angular.isObject(s.content)) s.content = {};

          const content = $c(angular.element(s.content.html || '<br/>'))
            (s.content.scope || s);

          const t1 = $t(() => {
            let prevContent = elem.children();
            prevContent.remove();
            elem.append(content);
            $t.cancel(t1);
          }, 0);

        });

        s.$on('$destroy', () => uppateContent());

      }
    })]);
