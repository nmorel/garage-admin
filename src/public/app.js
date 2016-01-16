angular.module('app', ['ngAnimate', 'ngMessages', 'ui.router', 'ui.bootstrap', 'toaster', 'ngTagsInput'])
  .config(function ($stateProvider, $urlRouterProvider, $uiViewScrollProvider) {
    //
    // For any unmatched url, redirect to /state1
    $urlRouterProvider.otherwise('/');

    // Using autoscroll to scroll to top when the view changes
    $uiViewScrollProvider.useAnchorScroll();

    //
    // Now set up the states
    $stateProvider
      .state('list', {
        url: '/',
        templateUrl: 'list/list.html',
        controller: 'ListController',
        controllerAs: 'vm',
        resolve: {
          cars: function (restService) {
            return restService.get('/api/cars');
          },
        },
      })
      .state('add', {
        url: '/new',
        templateUrl: 'edit/edit.html',
        controller: 'EditController',
        controllerAs: 'vm',
        resolve: {
          car: function () {
            return {};
          },
        },
      })
      .state('edit', {
        url: '/:id',
        templateUrl: 'edit/edit.html',
        controller: 'EditController',
        controllerAs: 'vm',
        resolve: {
          car: function (restService, $stateParams) {
            return restService.get('/api/cars/' + $stateParams.id);
          },
        },
      });
  });
