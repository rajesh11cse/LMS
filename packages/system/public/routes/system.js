'use strict';

// $viewPathProvider, to allow overriding system default views
angular.module('mean.system').provider('$viewPath', function() {
  function ViewPathProvider() {
    var overrides = {};

    this.path = function(path) {
      return function() {
        return overrides[path] || path;
      };
    };

    this.override = function(defaultPath, newPath) {
      if (overrides[defaultPath]) {
        throw new Error('View already has an override: ' + defaultPath);
      }
      overrides[defaultPath] = newPath;
    };

    this.$get = function() {
      return this;
    };
  }

  return new ViewPathProvider();
});

// $meanStateProvider, provider to wire up $viewPathProvider to $stateProvider
angular.module('mean.system').provider('$meanState', ['$stateProvider', '$viewPathProvider', function($stateProvider, $viewPathProvider) {
  this.state = function(stateName, data) {
    if (data.templateUrl) {
      data.templateUrl = $viewPathProvider.path(data.templateUrl);
    }
    $stateProvider.state(stateName, data);
    return this;
  };

  this.$get = function() {
    return this;
  };
}]);

//Setting up route
angular.module('mean.system').config(['$meanStateProvider', '$urlRouterProvider',
  function($meanStateProvider, $urlRouterProvider) {
    

    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope, SessionService) {
      // Initialize a new promise
      var deferred = $q.defer();
        // Authenticated
        if (SessionService.getSession('Authenticate') === 'true') {
          $rootScope.$emit('loggedin');
          $timeout(deferred.resolve);
        // Not Authenticated
        }else{
          $timeout(deferred.reject);
          $location.url('/');
        } 
      return deferred.promise;
    };

    var checkLoggedOut = function($q, $timeout, $http, $location, $rootScope, SessionService) {
      // Initialize a new promise
      var deferred = $q.defer();
        // Authenticated
        if (SessionService.getSession('Authenticate') === 'true') {
          $timeout(deferred.reject);
          $location.url('/superadminlogin');
        // Not Authenticated
        }else{
          $timeout(deferred.resolve);
          $location.url('/');
        } 
      return deferred.promise;
    };

    // For unmatched routes:
    $urlRouterProvider.otherwise('/');

    // states for my app
    $meanStateProvider
      .state('home', {
        url: '/',
        templateUrl: 'system/views/index.html',
        resolve :{checkLoggedOut: checkLoggedOut}      
      }).state('table',{
        url:'/tablecolor',
        templateUrl:'system/views/tablecolor.html',
        resolve :{checkLoggedin: checkLoggedin}
      })/*.state('userAdmin',{
        url:'/userAdmin?from',
        templateUrl:'system/views/userAdmin.html',
        resolve :{checkLoggedin: checkLoggedin}
      })*/.state('superadminloginpage',{
        url:'/superadminlogin',
        templateUrl:'system/views/welcomePage.html',
        resolve :{checkLoggedin: checkLoggedin}
      })/*.state('manageadmin',{
        url:'/manageadmin',
        templateUrl:'system/views/manageadmin.html',
        resolve :{checkLoggedin: checkLoggedin}
      })*//*.state('createadmin',{
        url:'/createadmin',
        templateUrl:'system/views/createAdmin.html',
        resolve :{checkLoggedin: checkLoggedin}
      })*//*.state('userdetail',{
        url:'/userdetail',
        templateUrl:'system/views/userDetail.html',
        resolve :{checkLoggedin: checkLoggedin}
      })*/.state('forgot_password', {
        url: '/forgot_password',
        templateUrl: 'system/views/forgot_password.html'
        //resolve: {loggedin: checkLoggedOut }
      }).state('reset_password', {
        url: '/reset_password',
        templateUrl: 'system/views/reset_password.html'
        //resolve: {loggedin: checkLoggedOut }
      });
  }
]).config(['$locationProvider',
  function($locationProvider) {
    $locationProvider.hashPrefix('!');
  }
]);
