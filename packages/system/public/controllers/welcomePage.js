'use strict';

angular.module('mean.system').controller('welcome-page-controller', function(SessionService, $log, $scope, $stateParams, 
  $http, $location, Global, $timeout, $sce, $window, Upload, Articles, toaster, httpErrorService, spinnerService, _ ) {

	$scope.clock = "loading clock..."; // initialise the time variable
    $scope.tickInterval = 1000 //ms
    $scope.today = new Date() //current date
    var tick = function() {
        $scope.clock = Date.now() // get the current time
        $timeout(tick, $scope.tickInterval); // reset the timer
    }

    // Start the timer
    $timeout(tick, $scope.tickInterval);
    $scope.todaysDate = new Date();
})