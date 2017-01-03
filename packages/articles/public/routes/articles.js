'use strict';

//Setting up route
angular.module('mean.articles').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // Check if the user is connected
    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope, SessionService) {
      // Initialize a new promise
      var deferred = $q.defer();
        // Authenticated

        if (SessionService.getSession('Authenticate') === 'true') {
          SessionService.setSession('urltype', 'appointment')
          $rootScope.$emit('loggedin');
          $timeout(deferred.resolve);
        // Not Authenticated
        }else{
          $timeout(deferred.reject);
          $location.url('/');
        } 
      return deferred.promise;
    };

  // states for my app
  $stateProvider
    .state('all articles', {
      url: '/articles',
      templateUrl: 'articles/views/articles.html',
      resolve :{checkLoggedin: checkLoggedin}
    })
    .state('create article', {
      url: '/articles/addArticles',
      templateUrl: 'articles/views/addArticles.html',
      resolve :{checkLoggedin: checkLoggedin}
    })
  }
]).config(['$locationProvider',
  function($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);
