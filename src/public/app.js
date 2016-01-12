angular.module('app', ['ngAnimate', 'ui.router', 'ui.bootstrap', 'toaster'])
  .config(function ($stateProvider, $urlRouterProvider) {
    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise('/');

    //
    // Now set up the states
    $stateProvider
      .state('list', {
        url: '/',
        templateUrl: 'list/list.html',
        controller: 'ListController',
        controllerAs: 'vm',
        resolve: {
          cars: function ($q, $http) {
            var deferred = $q.defer();

            $http.get('/api/cars').success(function (cars) {
              return deferred.resolve(cars);
            }).error(function (err) {
              return deferred.reject(err);
            });

            return deferred.promise;
          },
        },
      })
      .state('add', {
        url: '/new',
        templateUrl: 'edit/edit.html',
        controller: 'EditController',
        controllerAs: 'vm',
      })
      .state('edit', {
        url: '/:id',
        templateUrl: 'edit/edit.html',
        controller: 'EditController',
        controllerAs: 'vm',
      });
  });
