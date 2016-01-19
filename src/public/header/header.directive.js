(function () {
  'use strict';

  function appHeader(restService, toaster, $window, $state) {
    return {
      restrict: 'E',
      templateUrl: 'header/header.html',
      link: function (scope) {
        scope.onVisu = function () {
          scope.loading = true;
          restService.post('api/compile')
            .then(function () {
              $window.open('http://localhost:4000/front/');
              // Reloading state in case we pulled new modifications
              $state.go($state.current, {}, {
                reload: true,
              });
            })
            .catch(function () {
              toaster.pop('error', 'Erreur de génération', 'Pas de modifications en cours ?');
            })
            .finally(function () {
              scope.loading = false;
            });
        };

        scope.onPublish = function () {
          scope.loading = true;
          restService.post('api/publish')
            .then(function () {
              toaster.pop('success', 'Modifications publiées. Elles seront visibles dans quelques minutes.');
              // Reloading state in case we pulled new modifications
              $state.go($state.current, {}, {
                reload: true,
              });
            })
            .catch(function () {
              toaster.pop('error', 'Erreur de publication', 'Pas de modifications en cours ?');
            })
            .finally(function () {
              scope.loading = false;
            });
        };
      },
    };
  }

  angular.module('app')
    .directive('appHeader', appHeader);
})();
