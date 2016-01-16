(function () {
  'use strict';

  function ListController(cars, $state, $http, toaster) {
    var vm = this;
    vm.cars = cars;

    vm.onEdit = function (car) {
      $state.go('edit', {
        id: car.id,
      });
    };

    vm.onDelete = function (car) {
      $http.delete('/api/cars/' + car.id).success(function () {
        $http.get('/api/cars').success(function (_cars) {
          vm.cars = _cars;
        })
        .error(function(){
          toaster.pop('error', 'Erreur', 'Une erreur est survenue durant la récupération des voitures');
        });
        toaster.pop('success', 'Suppression effectuée');
      }).error(function () {
        toaster.pop('error', 'Erreur', 'Une erreur est survenue durant la suppression de la voiture');
      });
    };
  }

  angular.module('app')
    .controller('ListController', ListController);

})();
