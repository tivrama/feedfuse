angular.module('ff.directives').directive('searchbar', function() {
  return {
    restrict: 'E',
    templateUrl: '../../views/searchbar.html',
    replace: true
  };
});