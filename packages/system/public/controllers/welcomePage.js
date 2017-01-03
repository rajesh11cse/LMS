'use strict';

angular.module('mean.system').controller('welcome-page-controller', function(SessionService, $log, $scope, $stateParams, 
  $http, $location, Global, $timeout, $sce, $window, Upload, Articles, toaster, httpErrorService, spinnerService, _ ) {

	$scope.userToken = SessionService.getSession('userToken');
    $scope.sessionId = SessionService.getSession('sessionId');
    $scope.userType  = SessionService.getSession('usertype');
	$scope.clock = "loading clock..."; // initialise the time variable
    $scope.tickInterval = 1000 //ms
    $scope.today = new Date() //current date
      // Fuction callSuccessError to show sucees or error message /
    $scope.callSuccessError = function(type, title){
     // $('html, body').animate({scrollTop: 0}, 'slow');//Go back to top.
      toaster.pop({type: type, title: title});// Dispay a flash on brower along with title(message).
    };
    
    var tick = function() {
        $scope.clock = Date.now() // get the current time
        $timeout(tick, $scope.tickInterval); // reset the timer
    }

    // Start the timer
    $timeout(tick, $scope.tickInterval);
    $scope.todaysDate = new Date();
	$scope.welcome_To_Dashboard = function(){ 
		spinnerService.show('welcomePageSpinner');
		async.parallel([
			function(callback){
				if($scope.userType === 'superadmin'){
					$http.post('/getUsers', {'limit':100, 'pageNumber':1}).success(function(data){
						if(data.result == 'Success'){
							$scope.Total_Users 						= data.count;
							$scope.Total_Customer_Active_Users 		= _.where(data.data, {type:'customer', isActive: true}).length;
							$scope.Total_Customer_Deactive_Users 	= _.where(data.data, {type:'customer', isActive: false}).length;
							$scope.Total_Customer_Users 			= _.where(data.data, {type:'customer'}).length;
							$scope.Total_Editor_Active_Users 		= _.where(data.data, {type:'editor', isActive: true}).length;					
							$scope.Total_Editor_Deactive_Users 		= _.where(data.data, {type:'editor', isActive: false}).length;
							$scope.Total_Editor_Users 				= _.where(data.data, {type:'editor'}).length;
							callback(null, 'success')
						}else{
							callback(null, 'no super user')
						}
					}).error(function (data, status){
			          	var httpError = httpErrorService.httpErrorMessage(data, status);
			         	$scope.callSuccessError('error', httpError);
			         	callback(true, null)
					});
				}else{
					callback(null, 'success')
				}
			},

			function(callback){
				if($scope.userType === 'superadmin'){
					$http.get('/api/inactiveUsers').success(function(data){
						//var userArray = {};
						if(data.user){
							//var userArray = {};
							$scope.Total_Inactive_Users = data.user.length;
							//userArray['Total_Inactive_Users'] = $scope.Total_Inactive_Users;
							callback(null, 'success')
						}else{
							callback(null, 'no active user')
						}
					}).error(function (data, status){
			          	var httpError = httpErrorService.httpErrorMessage(data, status);
			         	$scope.callSuccessError('error', httpError);
			         	callback(true, null)
					});
				}else{
					callback(null, 'success')
				}
				
			},

			function(callback){
				if($scope.userType === 'superadmin'){
					$http.get('/api/activeUsers').success(function(data){
						//var userArray = {};
						if(data.user.length){
							//var userArray = {};
							$scope.Total_Active_Users = data.user.length;
							//userArray['Total_Active_Users'] = $scope.Total_Active_Users;
							callback(null, 'success')
						}else{
							callback(null, 'no inactive user')
						}
					}).error(function (data, status){
			          	var httpError = httpErrorService.httpErrorMessage(data, status);
			         	$scope.callSuccessError('error', httpError);
			         	callback(true, null)
					});
				}else{
					callback(null, 'success')
				}
			},

			function(callback){
				if($scope.userType === 'superadmin' || $scope.userType === 'customer'){
					$scope.appointmentsobj = {
						"sessionId" : $scope.sessionId,
						"userToken" : $scope.userToken,
					};
					$http.post('/zceapi/getAllAppointmentRequests', $scope.appointmentsobj).success(function(data){
						if(data.AppointmentRequests){
							//var userArray = {};
							$scope.Total_Appointment_Requests  = data.AppointmentRequests.length;
							$scope.Todays_Appointment_Requests = _.where(data.AppointmentRequests, {proposedDate:new Date()}).length;
							//userArray['Total_Appointment_Requests'] = $scope.Total_Appointment_Requests;
							callback(null, 'success')
						}else{
							callback(null, 'no appointments')
						}
					}).error(function (data, status){
			          	var httpError = httpErrorService.httpErrorMessage(data, status);
			         	$scope.callSuccessError('error', httpError);
			         	callback(true, null)
					});
				}else{
					callback(null, 'success')
				}
			},
			function(callback){
				if($scope.userType === 'superadmin' || $scope.userType === 'editor'){
					$http.post('/articles/getArticleForAdmin', {'limit':100000, 'pageNumber':1}).success(function(data){
						if(data.result == 'Success'){
							//var userArray = {};
							$scope.Total_Articles = data.data.length;
							$scope.Published_Articles = _.where(data.data, {isPublished:true}).length;
							//userArray['Total_Articles'] = $scope.Total_Articles;
							callback(null, 'success')
						}else{
							callback(null, 'no articles')
						}
					}).error(function (data, status){
			          	var httpError = httpErrorService.httpErrorMessage(data, status);
			         	$scope.callSuccessError('error', httpError);
			         	callback(true, null)
					});
				}else{
					callback(null, 'success')	
				}
			},
		], function(err, result){
			if(err){
				spinnerService.hide('welcomePageSpinner');
				$scope.callSuccessError('error', err);
			}else{
				$scope.Total_User_Admin =  ($scope.Total_Active_Users + $scope.Total_Inactive_Users);
				spinnerService.hide('welcomePageSpinner');
			}

		});
	}














})