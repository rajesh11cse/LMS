'use strict';

angular.module('mean.appointment').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {

    var checkLoggedin = function($q, $timeout, $http, $location, $rootScope, SessionService) {
      var deferred = $q.defer();
        if (SessionService.getSession('Authenticate') === 'true') {
          $rootScope.$emit('loggedin');
          $timeout(deferred.resolve);
        }else{
          $timeout(deferred.reject);
          $location.url('/');
        } 
      return deferred.promise;
    };

    $stateProvider.state('appointment example page', {
      url: '/appointment/example',
      templateUrl: 'appointment/views/index.html',
      resolve :{checkLoggedin: checkLoggedin}
    }).state('Get Appointments', {
      url: '/getAppointments',
      templateUrl: 'appointment/views/getAppointments.html',
      resolve :{checkLoggedin: checkLoggedin}
    }).state('recognizeUser', {
      url: '/recognizeUser?id',
      templateUrl: 'appointment/views/recognizeUser.html',
      resolve :{checkLoggedin: checkLoggedin}
    }).state('patientRecord', {
      url: '/patientRecord?id',
      templateUrl: 'appointment/views/patientRecord.html',
      resolve :{checkLoggedin: checkLoggedin}
    });
  }
])
