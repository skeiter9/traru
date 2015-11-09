'use strict';

export default angular
  .module('mdxIcon', [])
  .directive('mdxIcon', [() => {

    return (s, elem, attrs) => {

      s.$watch(() => attrs.mdxIcon, (icon, oldIcon) => {
        elem[0].classList.remove('mdi-' + oldIcon);
        elem[0].classList.add('mdi-' + icon);
      });

    };

  }]);
