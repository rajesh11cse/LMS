'use strict';

angular.module('mean.system').controller('library_tranctions_Ctrl',['SessionService', '$scope','$http','Global', 'toaster', 'httpErrorService', 'spinnerService', '$location',
	function(SessionService, $scope, $http, Global, toaster, httpErrorService, spinnerService, $location){
	    $scope.limit                = 5;  
	    $scope.currentPage          = 1;
	    $scope.maxSize              = 5;

		// Fuction callSuccessError to show sucees or error message /
	    $scope.callSuccessError = function(type, title){
	      toaster.pop({type: type, title: title});// Dispay a flash on brower along with title(message).
	    };

	    // Show details in pop-up functions
	    $scope.get_transaction_detail = function(data){
	     $scope.transaction_data = data;
	     console.log($scope.transaction_data.usrs.name);
	    };


		 // Show the the list of transactions.
		$scope.get_library_transactions = function(limit, pageNumber){
			spinnerService.show('userSpinner');
			$http.post('/api/lms/get_library_transactions', {limit:limit, pageNumber:pageNumber}).success(function(data){
				if(data.result == 'Success' && data.data.length>0){
					$scope.show_transactions = true;
					$scope.get_transactions  = data.data;
					$scope.total_trancations = data.count;
					$scope.indexIncrement = $scope.currentPage > 0 ? (($scope.currentPage-1)*$scope.limit): 0;
				}else{
					$scope.show_transactios = false; 
	      			$scope.callSuccessError('error', 'No trancations found in database');
				}
				spinnerService.hide('userSpinner');
			}).error(function (data, status){
			  	spinnerService.hide('userSpinner');
	          	var httpError = httpErrorService.httpErrorMessage(data, status);
	         	$scope.callSuccessError('error', httpError);
			});
		};

		$scope.pageChanged = function() {
           $scope.get_library_transactions($scope.limit, $scope.currentPage);
	     };

	}]);