function ngModelParser() {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: link
  };

  function link(scope, el, attrs, ctrl) {
    var parser = scope.$eval(attrs.ngModelParser);
    if (parser) {
      ctrl.$parsers.push(parser);
    }
  }
}

angular.module('app')
  .directive('ngModelParser', ngModelParser);
