export default angular
  .module('components.capitalize', [])
  .filter('capitalize', ['$log', capitalizeFilterFn])
  .filter('capitalizeAll', capitalizeAllFilterFn);

function capitalizeFilterFn($l) {

  return function capitalizeWord(word) {

    if (angular.isNumber(word) || angular.isDate(word)) return word;
    if (
      angular.isUndefined(word)
    ) return $l.warn(`the input word to ${word} fails`);

    var wordResult = word.toLowerCase();
    return wordResult.substring(0, 1).toUpperCase() + wordResult.substring(1);
  };

}

function capitalizeAllFilterFn(capitalizeFilter) {
  return function(sentence) {
    var auxSenetence = sentence.split(' ');
    var res = '';
    forEach(auxSenetence,  function(part) {
      res += capitalizeFilter(part) + ' ';
    });

    return res;
  };
};

capitalizeAllFilterFn.$inject = ['capitalizeFilter'];
