angular.module('ff.directives').directive('filter', function() {
  return {
    restrict: 'E',
    templateUrl: '../../views/filter.html',
    replace: false
  };
});