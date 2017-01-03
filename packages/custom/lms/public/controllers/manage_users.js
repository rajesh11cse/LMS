'use strict';

angular.module('mean.system').controller('manage_users_Ctrl',['SessionService', '$scope','$http','Global', 'toaster', 'httpErrorService', 'spinnerService', '$location',
	function(SessionService, $scope, $http, Global, toaster, httpErrorService, spinnerService, $location){
	    $scope.limit                =5;  
	    $scope.currentPage          = 1;
	    $scope.maxSize              = 5;
	    $scope.show_users           = false;
	    $scope.show_users_form      = false;
	    $scope.user                 = {};// initialize user attributs or params as empty object 


		// Fuction callSuccessError to show sucees or error message /
	    $scope.callSuccessError = function(type, title){
	      toaster.pop({type: type, title: title});// Dispay a flash on brower along with title(message).
	    };


		 // Show the the list of users.
		$scope.get_all_users = function(limit, pageNumber){
			spinnerService.show('userSpinner');
			$http.post('/api/lms/get_usrs', {limit:limit, pageNumber:pageNumber}).success(function(data){
				if(data.result == 'Success' && data.data.length>0){
					$scope.show_users = true;
					$scope.get_users  = data.data;
					$scope.total_users = data.count;
					$scope.indexIncrement = $scope.currentPage > 0 ? (($scope.currentPage-1)*$scope.limit): 0;
				}else{
					$scope.show_users = false; 
	      			$scope.callSuccessError('error', 'No users found in database');
				}
				spinnerService.hide('userSpinner');
			}).error(function (data, status){
			  	spinnerService.hide('userSpinner');
	          	var httpError = httpErrorService.httpErrorMessage(data, status);
	         	$scope.callSuccessError('error', httpError);
			});
		};


       // Add users.
		$scope.add_users = function(user){
			if(user){
				var user_Obj = {
					'usrName'             : user.u_name,
					'name'       	   	   : user.name,
					'contactNumber'   	   : user.mobileNo,
					'email'	           	   : user.email,
					'limit'                : $scope.limit, 
					'pageNumber'           : $scope.pageNumber
				}
				$http.post('/api/lms/add_usrs', user_Obj).success(function(data){
					if(data.result == 'Success' && data.data.length>0){
						$scope.show_users_form  = false;
						$scope.show_users     = true;
						$scope.get_users 	 = data.data;
						$scope.total_users 	 = data.count;
						$scope.indexIncrement = $scope.currentPage > 0 ? (($scope.currentPage-1)*$scope.limit): 0;
						$scope.callSuccessError('success', 'User has been added successfully');
					}else{
						$scope.show_users_form  = false;
						$scope.show_users = false;
		      			$scope.callSuccessError('error', 'No users found in database');
					}
				}).error(function (data, status){
		          	var httpError = httpErrorService.httpErrorMessage(data, status);
		         	$scope.callSuccessError('error', httpError);
				});
			}else{
				$scope.callSuccessError('error', '(*) required fields.');
			}
		}


		// Delete user.
		$scope.remove_user = function(user){
			 if(window.confirm('Are you sure you want to delete the user ?')){
				$http.delete('/api/lms/remove_usr', {'id':user._id, 'limit': $scope.limit, 'pageNumber': $scope.currentPage}).success(function(data){
					if(data.result == 'Success' && data.data.length>0){
						$scope.get_users 	 = data.data;
						$scope.total_users 	 = data.count;
						$scope.indexIncrement = $scope.currentPage > 0 ? (($scope.currentPage-1)*$scope.limit): 0;
						$scope.callSuccessError('success', 'User has been removed successfully');
					}else{
						$scope.show_users_form  = false;
						$scope.show_users = false;
		      			$scope.callSuccessError('error', 'No users found in database.');
					}
				}).error(function (data, status){
		          	var httpError = httpErrorService.httpErrorMessage(data, status);
		         	$scope.callSuccessError('error', httpError);
				});
			}
		}

		// Activate user.
		$scope.activateuser = function(user){
			 if(window.confirm('Are you sure you want to activate user '+user.name+' ?')){
				$http.put('/activateUser', {'id':user._id, 'limit': $scope.limit, 'pageNumber': $scope.currentPage}).success(function(data){
					if(data.result == 'Success' && data.data.length>0){
						$scope.getUsers 	 = data.data;
						$scope.totalUser 	 = data.count;
						$scope.callSuccessError('success', 'User has been activated successfully');
					}else{
						$scope.show_users_form  = false;
						$scope.show_users = false;
		      			$scope.callSuccessError('error', 'Unable to activate user.');
					}
				}).error(function (data, status){
		          	var httpError = httpErrorService.httpErrorMessage(data, status);
		         	$scope.callSuccessError('error', httpError);
				});
			}
		}
        // Deactivate user.
		$scope.deactivateuser = function(user){
			if(window.confirm('Are you sure you want to deactivate user '+user.name+' ?')){
				$http.put('/deactivateUser', {'id':user._id, 'limit' : $scope.limit, 'pageNumber': $scope.currentPage}).success(function(data){
					if(data.result == 'Success' && data.data.length>0){
						$scope.getUsers 	 = data.data;
						$scope.totalUser 	 = data.count;
						$scope.callSuccessError('success', 'User has been deactivated successfully');
					}else{
						$scope.show_users_form  = false;
						$scope.show_users = false;
		      			$scope.callSuccessError('error', 'Unable to deactivate user.');
					}
				}).error(function (data, status){
		          	var httpError = httpErrorService.httpErrorMessage(data, status);
		         	$scope.callSuccessError('error', httpError);
				});
			}
		}

		$scope.pageChanged = function() {
           $scope.get_all_users($scope.limit, $scope.currentPage);
	     };

	}]);