export default angular.module('utilsDirectives', [])

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

      attrs.$observe('initialize', (nv) => {
        const pluralName = angular.isObject(vm.module) &&
          angular.isString(vm.module.name) ?
            vm.module.name.toUpperCase() + '_PLURAL' :
            'ANONYMOUS_PLURAL';
        vm.pluralName = $tr.instant(`MODEL.${pluralName}`);
        vm.initialize = !!nv;
      });

    }
  })]);
