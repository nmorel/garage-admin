(function () {
  'use strict';

  function EditController($scope, car, $state, $timeout, restService, toaster, Upload) {
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
      return modelValue.map(function (val) {
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
            restService.put('api/cars/' + vm.car.id, car)
              .then(function () {
                toaster.pop('success', 'Modifications sauvegardées');
                refreshCar();
              }, function () {
                toaster.pop('error', 'Erreur', 'Une erreur est survenue durant la modification');
              });
          } else {
            restService.post('api/cars', car)
              .then(function (_car) {
                toaster.pop('success', 'Voiture ajoutée');
                $state.go('edit', {id: _car.id});
              }, function () {
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

    vm.deletePhoto = function (photo) {
      if (vm.uploading) {
        return;
      }

      restService.delete('api/cars/' + vm.car.id + '/photos/' + photo.id)
        .then(function () {
          toaster.pop('success', 'Photo supprimée');
          _.remove(vm.car.photos, function (_photo) {
            return photo.id === _photo.id;
          });
        }, function () {
          toaster.pop('error', 'Erreur', 'Une erreur est survenue durant la suppression de la photo');
        });
    };

    vm.addPhotos = function (photos) {
      vm.uploading = true;
      vm.progress = 0;
      Upload.upload({
          url: 'api/cars/' + vm.car.id + '/photos/',
          data: {
            file: photos,
          },
        })
        .then(function () {
          toaster.pop('success', 'Photos ajoutées');
          refreshCar();
        }, function () {
          toaster.pop('error', 'Erreur', 'Une erreur est survenue durant l\'upload des photos');
        }, function (evt) {
          vm.progress = parseInt(100.0 * evt.loaded / evt.total, 10);
        })
        .finally(function () {
          vm.uploading = false;
          delete vm.progress;
        });
    };

    vm.onDropPhoto = function ($index) {
      vm.car.photos.splice($index, 1);
      restService.put('api/cars/' + vm.car.id, car)
        .then(function () {
          toaster.pop('success', 'Modifications sauvegardées');
          refreshCar();
        }, function () {
          toaster.pop('error', 'Erreur', 'Une erreur est survenue durant la modification');
        });
    };

    function refreshCar() {
      $state.go($state.current, {}, {
        reload: true,
      });
    }

  }

  angular.module('app')
    .controller('EditController', EditController);

})();
