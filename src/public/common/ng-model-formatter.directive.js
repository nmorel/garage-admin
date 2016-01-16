function ngModelFormatter() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: link
  };

  function link(scope, el, attrs, ctrl) {
    var formatter = scope.$eval(attrs.ngModelFormatter);
    if (formatter) {
      ctrl.$formatters.push(formatter);
    }
  }
}

angular.module('app')
  .directive('ngModelFormatter', ngModelFormatter);

