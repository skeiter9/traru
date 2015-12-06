export default angular.module('utilsDirectives', [])

  .directive('spinnerMain', ['$document', '$timeout', ($d, $t) => ({
    restrict: 'A',
    link(s, elem, attrs) {
      const w = attrs.$observe('spinnerMain', (nV) => {
        console.log(nV);
        const bodyTag = $d[0].body;
        if (nV === 'true') bodyTag.classList.remove('spinner-main-activate');
        else bodyTag.classList.add('spinner-main-activate');
      });
      s.$on('$destroy', () => w());
    }
  })])

  .directive('sectionInner', [() => ({
    restrict: 'E',
    transclude: true,
    template: `
      <div layout class='section--inner'>
        <md-toolbar></md-toolbar>
        <div ng-transclude></div>
      </div>
    `
  })])

  .directive('mdMenuInListItem', [() => ({
    restrict: 'C',
    link(s, elem, attrs) {
      const pa = elem.parent().parent().parent();
      if (pa[0].tagName === 'MD-LIST-ITEM') {
        pa.append(elem);
        pa.find('button').find('div').eq(0).css({width: 'calc(100% - 48px)'});
      }
    }
  })])

  .directive('moduleListWrapper', ['$timeout', '$translate', '$log',
  '$rootScope',
  ($t, $tr, $l, $rS) => ({
    restrict: 'E',
    scope: {
      module: '=',
      items: '='
    },
    bindToController: true,
    controller: angular.noop,
    controllerAs: 'vm',
    transclude: true,
    template: require('./utils-module-list.jade')(),
    link(s, elem, attrs, vm) {

      let t1 = null;

      const w = attrs.$observe('initialize', (nv) => {
        //console.log(!!nv, vm.module.name);
        const pluralName = angular.isObject(vm.module) &&
          angular.isString(vm.module.name) ?
            vm.module.name.toUpperCase() + '_PLURAL' : 'ANONYMOUS_PLURAL';
        if (!!nv) {
          t1 = $t(() => {
            vm.pluralName = $tr.instant(`MODEL.${pluralName}`);
            vm.initialize = true;
          }, 0);
        }

      });

      s.$on('$destroy', () => {
        w();
        !!t1 ? $t.cancel(t1) : ''
      });

    }
  })]);
