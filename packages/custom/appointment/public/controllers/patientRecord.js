angular.module('mean.system').controller('PatientRecordCtrl', function(SessionService, $scope, $stateParams, Global, $http,$timeout, $location, 
	$window, toaster, httpErrorService, spinnerService) {
    $scope.userToken = SessionService.getSession('userToken');
    $scope.sessionId = SessionService.getSession('sessionId');

    $scope.welcome_To_Dashboard = function(){ 
		spinnerService.show('welcomePageSpinner');
		spinnerService.hide('welcomePageSpinner');
	}

	$scope.getPatients = function(search){
		$scope.showPatientDetail = false;
		if(search.length>2){
	      if(search.match("^[(0-9)]"+".*")){
	        var patient_promie = $http.post('/zceapi/searchPatients?patientName=&mobileNumber='+search,{userToken : $scope.userToken, sessionId : $scope.sessionId});
	          patient_promie.success(function (response){
	          	if(response.patients.length>0){
	          		$scope.patientDetail = response.patients;
	          		$scope.showTable = true;
	          		$scope.patient_found = false;
	          	}else{
	          		$scope.showTable = false;
					$scope.patient_found = true;
		        }
	        }).error(function(data){
				var httpError = httpErrorService.httpErrorMessage(data, status);
			    $scope.callSuccessError('error', httpError);
			});
	      } else {
	        var patient_promie = $http.post('/zceapi/searchPatients?patientName='+search+'&mobileNumber=', {userToken : $scope.userToken,sessionId:$scope.sessionId});
	          patient_promie.success(function (response){
	            if(response.patients.length>0){
	          		$scope.patientDetail = response.patients;
	          		$scope.showTable = true;
	          		$scope.patient_found = false;
	          	}else{
	          		$scope.showTable = false;
					$scope.patient_found = true;
	          	}
	        }).error(function(data){
				var httpError = httpErrorService.httpErrorMessage(data, status);
			    $scope.callSuccessError('error', httpError);
			});
	      }
	    }else{
	    	$scope.showTable = false;
	    }
	};

	$scope.welcome_To_Dashboard = function(){ 
		spinnerService.show('welcomePageSpinner');
		spinnerService.hide('welcomePageSpinner');
	}

 	$scope.callSuccessError = function(type, title){
      toaster.pop({type: type, title: title});// Dispay a flash on brower along with title(message).
    };

	$scope.goToTreatments = function(data){
		spinnerService.show('welcomePageSpinner');
		if(window.confirm("Are you sure you want to see all the treatments of the patient "+data.patientName+"?")) {

			$scope.appointmentsobj = {
				"sessionId" : $scope.sessionId,
				"userToken" : $scope.userToken,
				"id" : data.appointmentRequestId,
			};

			$http.post('/zceapi/findAppointmentRequestById', $scope.appointmentsobj).success(function(response){

				if(response.appointmentRequest && response.appointmentRequest.length>0){
					spinnerService.hide('welcomePageSpinner');
					localStorage.setItem("currentAppointment", JSON.stringify(response.appointmentRequest[0]));
					$location.url('/recognizeUser?id='+data.userId);
				}else{
					$scope.callSuccessError('error', 'No such appointment request found for patient '+data.patientName);
				}

			}).error(function(data){
				var httpError = httpErrorService.httpErrorMessage(data, status);
			    $scope.callSuccessError('error', httpError);
			});
		}
		
	};;

});