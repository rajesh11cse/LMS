angular.module('mean.appointment').controller('GetAppointmentCtrl', function(SessionService, $scope, $stateParams, Global, $http, httpErrorService, toaster){
	$scope.start=0;
    $scope.end=5;
    $scope.userToken = SessionService.getSession('userToken');
    $scope.sessionId = SessionService.getSession('sessionId');

    $scope.limit = 5;
    $scope.currentPage = 1;
    $scope.maxSize = 5;
	$scope.showInactive = true;
	$scope.indexIncrement = 0;
	$scope.noAppRequest = false;

    // Fuction callSuccessError to show sucees or error message /
    $scope.callSuccessError = function(type, title){
     // $('html, body').animate({scrollTop: 0}, 'slow');//Go back to top.
      toaster.pop({type: type, title: title});// Dispay a flash on brower along with title(message).
    };
	$scope.getAppointments = function(){
		$scope.appointmentsobj = {
			"sessionId" : $scope.sessionId,
			"userToken" : $scope.userToken,
			"pageSize": 10,
			"currentPage": 1
		};

		$scope.myPromise = $http.post('/zceapi/getAllAppointmentRequests', $scope.appointmentsobj);

		$scope.myPromise.success(function(data){
			if(data.AppointmentRequests.length>0){
				$scope.loadDone = true;
				$scope.noAppRequest = false;
				$scope.Appointments = data.AppointmentRequests;
				$scope.totalUser = data.AppointmentRequests.length;
				$scope.indexIncrement = $scope.currentPage > 0 ? (($scope.currentPage-1)*$scope.limit): 0;
			}else{
				$scope.loadDone = true;
				$scope.noAppRequest = true;
				$scope.totalUser = 0;
			}
		}).error(function (data, status){
          	var httpError = httpErrorService.httpErrorMessage(data, status);
         	$scope.callSuccessError('error', httpError);
		});
	};

	$scope.getAppointments();
	
	$scope.recognizeUser = function(data){
		localStorage.setItem("currentAppointment", JSON.stringify(data));
	};

	$scope.pageChanged = function() {
		localStorage.setItem("currentPage", $scope.currentPage);
		$scope.indexIncrement = $scope.currentPage > 0 ? (($scope.currentPage-1)*$scope.limit): 0;
		$scope.start = $scope.limit*($scope.currentPage-1);
        $scope.end   = $scope.limit*$scope.currentPage;

     };

});
angular.module('mean.system').filter('slice', function() {
  return function(arr, start, end) {
      if(arr){
          return arr.slice(start, end);
      }
  	};
});