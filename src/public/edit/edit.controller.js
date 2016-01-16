(function () {
  'use strict';

  function EditController($scope, car, $state, $timeout, restService, toaster) {
    var vm = this;
    vm.car = car;

    vm.transmissions = [
      'Manuelle',
      'Automatique',
    ];

    vm.fuelTypes = [
      'Diesel',
      'Essence',
      'Hybride',
      'Electrique',
      'GPL',
    ];

    if (!vm.car.id) {
      vm.car.transmission = vm.transmissions[0];
      vm.car.fuelType = vm.fuelTypes[0];
    }

    vm.parseTags = function (viewValue) {
      if (angular.isUndefined(viewValue)) {
        return viewValue;
      }

      return viewValue.map(function (val) {
        return val.text;
      });
    };

    vm.formatTags = function (modelValue) {
      if (angular.isUndefined(modelValue)) {
        return modelValue;
      }
      return modelValue.map(function(val) {
        return {
          text: val
        };
      });
    };

    vm.submitForm = function () {
      $timeout(function () {
        $scope.$broadcast('show-errors-check-validity');
        if (vm.form.$valid) {
          if (vm.car.id) {
            restService.put('/api/cars/' + vm.car.id, car)
              .then(function () {
                toaster.pop('success', 'Modifications sauvegardées');
                $state.go($state.current, {}, {
                  reload: true,
                });
              }, function (err) {
                toaster.pop('error', 'Erreur', 'Une erreur est survenue durant la modification');
              });
          } else {
            restService.post('/api/cars', car)
              .then(function (_car) {
                toaster.pop('success', 'Voiture ajoutée');
                $state.go('edit', {id: _car.id});
              }, function (err) {
                toaster.pop('error', 'Erreur', 'Une erreur est survenue durant la création');
              });
          }
        }
      });
    };

    vm.resetForm = function () {
      $state.go($state.current, {}, {
        reload: true,
      });
    };
  }

  angular.module('app')
    .controller('EditController', EditController);

})();
