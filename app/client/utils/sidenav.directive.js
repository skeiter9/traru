export default angular.module('componentsSidenavContent', ['ngMaterial'])

  .directive('mdSelectBackdrop', ['$mdSidenav', '$document', ($mdS, $d) => ({
    restrict: 'C',
    link(s, elem) {
      $d[0].body.style.removeProperty('overflow');
    }
  })])

  .directive('mdSidenavBackdrop', ['$mdSidenav', '$document', '$state',
  ($mdS, $d, $st) => ({
    restrict: 'C',
    priority: 2000,
    link(s, elem, attrs) {

      elem[0].addEventListener('click', (e) => {
        //e.preventDefault();
        //e.stopPropagation();
        if ($st.current.name.indexOf('.') !== -1)  $st.go('^');
      });

      const bodyTag = $d[0].body;
      const w1 = s.$watchGroup([
        () => $mdS('left').isOpen(),
        () => $mdS('right').isOpen()
      ],
      (nVs, oVs) => {
        if (!nVs[0] && !nVs[1] &&
          !bodyTag.classList.contains('spinner-main-activate')
        ) bodyTag.style.removeProperty('overflow');
        else bodyTag.style.overflow = 'hidden';
      });

      s.$on('$destroy', () => w1());

    }
  })]);

