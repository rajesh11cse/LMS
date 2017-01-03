
angular.module('mean.system').controller('recognizeUserCtrl', function(SessionService, $scope, $stateParams, Global, $http, $timeout, $window,
	toaster, httpErrorService, spinnerService) {
    $scope.userToken = SessionService.getSession('userToken');
    $scope.sessionId = SessionService.getSession('sessionId');
    $scope.start = $scope.start2 = 0;
    $scope.end = $scope.end2 = 5;
    $scope.limit = 5;
    $scope.currentPage = 1;
    $scope.currentPage2 = 1;
    $scope.maxSize = 5;
	$scope.showInactive = true;
	$scope.indexIncrement = 0;
	$scope.successHidden = true;
	$scope.errorHidden = true;
	$scope.patientRegistrationData = {};
    $scope.currentAppointment = JSON.parse(localStorage.getItem('currentAppointment'));
    $scope.currentAppointmentReason = $scope.currentAppointment.appointmentReason;
    $scope.appPRNo =  $scope.currentAppointment.patientRegistrationNumber;
    $scope.UpdatedPRN = "";
    $scope.userId    = $stateParams.id;

 	$scope.callSuccessError = function(type, title){
      toaster.pop({type: type, title: title});// Dispay a flash on brower along with title(message).
    };


    if($scope.currentAppointment.treatment != undefined && $scope.currentAppointment.treatment._id != undefined) $scope.currentTreatmentId = $scope.currentAppointment.treatment._id.$oid;
    else $scope.currentTreatmentId = '';

    if($scope.appPRNo == undefined){
    	$scope.appPRNo = "";
    }


    //>>>>>>>>>>>>>>>>> Calendar for Date of Birth >>>>>>>>>>>>>>//
    $scope.today = function() {
  		$scope.dob = new Date();
    };
    $scope.today();
    $scope.dateOptions = {
      	formatYear: 'yy',
      	maxDate: new Date(),
      	startingDay: 1
    };

    $scope.open = function() {
      $scope.popup.opened = true;
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];

    $scope.popup = {
      	opened: false
    };

    if($scope.currentAppointment.patientMobileNumber != undefined && $scope.currentAppointment.patientMobileNumber != '' ){
    	$scope.patientRegistrationData.mobileNo =  $scope.currentAppointment.patientMobileNumber;
    }
    if($scope.currentAppointment.dateOfBirth != undefined && $scope.currentAppointment.dateOfBirth != '' ){
    	$scope.dob =  new Date($scope.currentAppointment.dateOfBirth);
    }

    // Get all treatment of the recognized patient
    $scope.getTreatmentByTreatmentId = function(id){
		$scope.treatmentObj = {
			"sessionId" : $scope.sessionId,
			"userToken" : $scope.userToken,
		    "treatmentId" : id
		};

		$http.post('/zceapi/getTreatmentByTreatmentId', $scope.treatmentObj).success(function(data){
			if(data){
				$scope.selectedTreatment = data.Treatment[0].panel;
			}else{
				 $scope.callSuccessError('error', 'Error');
			}
		}).error(function(data){
			var httpError = httpErrorService.httpErrorMessage(data, status);
		    $scope.callSuccessError('error', httpError);
		});
	};


	$scope.checkAvailability = function(DoctoerId) {
		if($scope.selectedTreatment != undefined){
			return $scope.selectedTreatment.some(function(arrVal) {
		        return DoctoerId === arrVal.professionalId;
		    });
		}
	}

	$scope.myfunc = function(id) {
	        return parseInt(id);
	};
 
 	// Get doctors list to add the to panel.
	$scope.getAllProfessional = function(){
		$scope.appointmentsobj = {
			"sessionId" : $scope.sessionId,
			"userToken" : $scope.userToken,
		};

		$http.post('/zceapi/getAllProfessional', $scope.appointmentsobj).success(function(data){
			$scope.AllProfessional = data.professionals;
			$scope.getTreatmentByTreatmentId($scope.tId);
		}).error(function(data){
			var httpError = httpErrorService.httpErrorMessage(data, status);
		    $scope.callSuccessError('error', httpError);
		});
	};
	

	// Get patients according appointment user id.
	$scope.getPatients = function(id){
		$scope.patientObj = {
			"sessionId" : $scope.sessionId,
			"userToken" : $scope.userToken,
			"userId" : id,
		    "patientName" : $scope.currentAppointment.patientName,
     		"patientAge" : $scope.currentAppointment.patientAge,
    		"dateOfBirth" : ""

		};

		$http.post('/zceapi/getPatients', $scope.patientObj).success(function(data){
			if(data.Patients.length>0){
				$scope.showPatients = true;
				$scope.patientDetail = data.Patients
				$scope.totalUser = data.Patients.length;
				$scope.indexIncrement = $scope.currentPage > 0 ? (($scope.currentPage-1)*$scope.limit): 0;
				$scope.showCurrentPatient = true;
			}else{
				$scope.showPatients = false;
				$scope.errorMessage = 'No such patient is recognized. Please try another or register a patient.';
				$scope.callSuccessError('error', $scope.errorMessage);
			}
			
		}).error(function(data){
			var httpError = httpErrorService.httpErrorMessage(data, status);
		    $scope.callSuccessError('error', httpError);
		});
	};


	if($scope.userId){
		$scope.getPatients($scope.userId);
	}


	$scope.clear = function(){
		$scope.dob = '';
		$scope.patientRegistrationData.mobileNo = '';
		$scope.registraionSuccess = false;
	};

	if($scope.currentAppointment){
    	$scope.patientRegistrationData.patientName = $scope.currentAppointment.patientName;
    	$scope.patientRegistrationData.Age = $scope.currentAppointment.patientAge;
    }

	// Register a new petient if it is not recognized.
	$scope.registerPatient = function(patientRegistrationData, dob){
		$scope.patientObj = {
			"sessionId" : $scope.sessionId,
			"userToken" : $scope.userToken,
			"userId" : $scope.userId,
			"patientName": patientRegistrationData.patientName,
		    "patientAge": patientRegistrationData.Age,
		    "dateOfBirth": dob,
		    "mobileNumber": patientRegistrationData.mobileNo,
		    "appointmentRequestId":$scope.currentAppointment._id.$oid   
  
		};
		$http.post('/zceapi/addPatients', $scope.patientObj).success(function(data){
			if(data.result == 'success'){
				$scope.callSuccessError('success', 'Registration Successful !');
 				$scope.getPatients($scope.userId);
			}else{
				$scope.callSuccessError('error', 'Error');
			}
			
		}).error(function(data){
			var httpError = httpErrorService.httpErrorMessage(data, status);
		    $scope.callSuccessError('error', httpError);
		});
	};

	// Go back to top by scroll.
	$scope.scrollTop = function() {
      $('html,body').animate({scrollTop: document.body.scrollHeight},"slow");
    };

    // Get treatment of a recognized according patient register number.
	$scope.getTreatments = function(patientRegistrationNumber){
		$scope.treatmentObj = {
			"sessionId" : $scope.sessionId,
			"userToken" : $scope.userToken,
		    "patientRegistrationNumber" : patientRegistrationNumber
		};

		$http.post('zceapi/getTreatment', $scope.treatmentObj).success(function(data){
			if(data){
				$scope.showTreatment = true;
				$scope.patientTreatment = data;
				$scope.totalTreatment = data.length;
				$scope.indexIncrement2 = $scope.currentPage2 > 0 ? (($scope.currentPage2-1)*$scope.limit): 0;
				$scope.scrollTop();
			}else{
				$scope.showTreatment = false;
			}
		}).error(function(data){
			var httpError = httpErrorService.httpErrorMessage(data, status);
		    $scope.callSuccessError('error', httpError);
		});
	};


	// Select a patient from all patinent to add to current appointemnt.
	$scope.selectPatient = function(PatientData){
		$scope.selectedPatientObj = {
			"sessionId" : $scope.sessionId,
			"userToken" : $scope.userToken,
		    "patientRegistrationNumber" : PatientData.patientRegistrationNumber,
		    "appointmentRequestId" : $scope.currentAppointment._id.$oid
		};

		$http.post('/zceapi/updatePatientRegistrationNumber', $scope.selectedPatientObj).success(function(data){
			if(data.result == 'success'){
				$scope.appPRNo = PatientData.patientRegistrationNumber;
				$scope.showPagination = false;
				$scope.getPatients($scope.userId);
			}else{
				$scope.callSuccessError('error', "Patient Registration Number not updated in appointment");
			}
		}).error(function(data){
			var httpError = httpErrorService.httpErrorMessage(data, status);
		    $scope.callSuccessError('error', httpError);
		});
	};


	// If selected patient is not recognized then change the patient.
	$scope.changeCurrentPatient = function(){
		$scope.appPRNo = "";
		$scope.showTreatment = false;
		$scope.showPagination = true;
	};

	// Go to see all the treatments of the recognized patient.
	$scope.goToTreatments = function(data){
		$scope.showCurrentPatient = true;
		$scope.pId = data._id.$oid;
		$scope.registraionSuccess = false;
		$scope.currentPatient = data;
		$scope.currentPatientRegNo = data.patientRegistrationNumber;
		if(window.confirm("Are you sure you want to see all the treatments of the patient "+data.patientName+"?")) {
			$scope.getTreatments(data.patientRegistrationNumber);
		}
	};

    // Open professional list throgh popup.
	$scope.goToPanel = function(data){
		$scope.tId = data._id.$oid
		$scope.getAllProfessional();
	}

	$scope.openTreatmentModal = function(data){
		$scope.TreatmentDetail = data;
	}

    // Open a popup to close treatment.
	$scope.goForcloseTreatment = function(id){
		$scope.closeTreatmentId = id;
	}

    // Close treatment function.
	$scope.closeTreatment = function(reason){
		if(window.confirm("Are you sure you want to close the treatment of patient "+$scope.currentPatient.patientName+"?")) {
			$scope.treatmentClosedObj = {
				"sessionId" 		: $scope.sessionId,
				"userToken" 		: $scope.userToken,
			    "treatmentStatus" 	: "Closed",
			    "reasonForClosure" 	: reason,
			    "treatmentId" 		: $scope.closeTreatmentId
			};

			if(reason == undefined || reason == ''){
				$scope.errorMessage = 'Reason or patient feedback is required to close the treatment.';
				$scope.callSuccessError('error', $scope.errorMessage);
			}else{
				$http.post('/zceapi/updateTreatmentStatusClosed', $scope.treatmentClosedObj).success(function(data){
					if(data.result == 'success'){
						$scope.callSuccessError('success', 'Treatment has been closed successfully.');
						$scope.getTreatments($scope.currentPatient.patientRegistrationNumber);
						
					}else{
						$scope.callSuccessError('error', 'Error');
					}
				}).error(function(data){
					var httpError = httpErrorService.httpErrorMessage(data, status);
				    $scope.callSuccessError('error', httpError);
				});
			}
		}
	}

    // Create treatment function.
	$scope.createTreatment = function(){
		if(window.confirm("Are you sure you want to create a treatment for patient "+$scope.currentPatient.patientName+"?")) {
			$scope.treatmentObj = {
				"sessionId" : $scope.sessionId,
				"userToken" : $scope.userToken,
			     "professionalId" : $scope.currentAppointment.professionalId,
			     "primaryProfessionalId" : "",
			     "treatmentStatus" : "New",
			     "patientId" : $scope.currentPatient._id.$oid,
			     "appointmentReason" : $scope.currentAppointment.appointmentReason,
			     "referredProfessionalId" : "",
			     "userId" : $scope.userId,
			     "patientName" : $scope.currentPatient.patientName,
			     "patientAge" : $scope.currentPatient.patientAge,
			     "dateOfBirth" : $scope.currentPatient.dateOfBirth,
			     "mobileNumber" : $scope.currentPatient.mobileNumber
			};

			$http.post('/zceapi/addTreatment', $scope.treatmentObj).success(function(data){
				if(data.result == 'success'){
					$scope.getTreatments($scope.currentPatient.patientRegistrationNumber);
				}else{
					$scope.callSuccessError('error', "Error");
				}
				
			}).error(function(data){
				var httpError = httpErrorService.httpErrorMessage(data, status);
			    $scope.callSuccessError('error', httpError);
			});
		}
	};

	// Add created or old treatment to current appointment.
	$scope.addTratmentToAppointmnet = function(treatmentObj){
		if(window.confirm("Are you sure you want to update selected treatment to current appointment ?")) {
			$scope.params = {
				"sessionId" : $scope.sessionId,
				"userToken" : $scope.userToken,
			    "appointmentRequestId" : $scope.currentAppointment._id.$oid,
			    "treatment" : treatmentObj
			};
			$http.post('/zceapi/addTreatmentToAppointmentRequest', $scope.params).success(function(data){
				if(data.result == 'success'){
					$scope.currentTreatmentId = treatmentObj._id.$oid;
					$scope.callSuccessError('success', 'Current appointment updated successfully.');
				}else{
					$scope.callSuccessError('error', "Error");
				}
			}).error(function(data){
				var httpError = httpErrorService.httpErrorMessage(data, status);
			    $scope.callSuccessError('error', httpError);
			});
		}
	};

	// Request or send a mail to doctor while adding doctoer to panel
	$scope.appointmentRequestMail = function(profId, patientId, appReason, patientName){
		var appReqMailObj = {
          "userId"				: 		patientId,
          "professionalId"		: 		profId,
          "appointmentReason" 	: 		appReason != undefined ? appReason : "",
          "patientName"			:    	patientName
        }

		$http.post('/api/users/appointmentRequestMail', appReqMailObj).success(function(data){
			if(data.result == 'success'){
			}else{
			}
		}).error(function(data){
			var httpError = httpErrorService.httpErrorMessage(data, status);
		    $scope.callSuccessError('error', httpError);
		});
	}

	// Add doctor to panel.
	$scope.panelArray = {};
	$scope.AddDoctorToPanel = function(id, reason){
		if(window.confirm("Are you sure you want to add this to panel ?")) {
			$scope.panelObj = {
				"sessionId" : $scope.sessionId,
				"userToken" : $scope.userToken,
			    "professionalId" : id,
			    "primaryProfessionalId" : id,
			    "status":"New",
			    "patientId" : $scope.pId,
			    "treatmentId":$scope.tId,
			    "appointmentReason" : reason != undefined ? reason : "",
			    "referredProfessionalId" : "",
			    "appointmentRequestId" : $scope.currentAppointment._id.$oid
			};

			$http.post('/zceapi/addPanel', $scope.panelObj).success(function(data){
				if(data.result == 'success'){
					$scope.getTreatmentByTreatmentId($scope.tId);

					var notificationParams = {
		              "sessionId"	: $scope.currentAppointment.userId,
		              "userId"		: id,
		              "message"		: $scope.currentPatient.patientName+' has sent you an appointment request.',
		              "title"		:'Appointment Request Received'
		            }
					$http.post('zceapi/addAppointmentNotification', notificationParams).success(function(data){
						$scope.appointmentRequestMail(id, $scope.currentPatient.userId, $scope.currentAppointment.appointmentReason, $scope.currentPatient.patientName);
					}).error(function(data){
						var httpError = httpErrorService.httpErrorMessage(data, status);
					    $scope.callSuccessError('error', httpError);
					});

				}else{
					$scope.callSuccessError('error', "Panel not added");
				}
			}).error(function(data){
				var httpError = httpErrorService.httpErrorMessage(data, status);
			    $scope.callSuccessError('error', httpError);
			});
		}
	};

	// remove doctor form panel.
	$scope.RemoveDoctorFromPanel = function(id){
		$scope.panelObj = {
			"sessionId" : $scope.sessionId,
			"userToken" : $scope.userToken,
		    "professionalId" : id,
		    "treatmentId":$scope.tId,
		    "appointmentRequestId" : $scope.currentAppointment._id.$oid
		};
		$http.post('/zceapi/removePanel', $scope.panelObj).success(function(data){
			if(data.result == 'success'){
				$scope.donePrimary = false;
				$scope.myProId = 0;
				$scope.getTreatmentByTreatmentId($scope.tId);
			}else{
				$scope.callSuccessError('error', "Not able to remove");
			}
		}).error(function(data){
			var httpError = httpErrorService.httpErrorMessage(data, status);
		    $scope.callSuccessError('error', httpError);
		});
	};

	// Make a doctor primary.
	$scope.makePrimary = function(id){
		$scope.makePrimaryObj = {
			"sessionId" : $scope.sessionId,
			"userToken" : $scope.userToken,
		    "professionalId" : id,
		    "patientId" : $scope.pId,
		    "treatmentId":$scope.tId,
		    "appointmentRequestId" : $scope.currentAppointment._id.$oid
		};

		$http.post('/zceapi/makePrimaryDoctor', $scope.makePrimaryObj).success(function(data){
			if(data.result == 'success'){
				$scope.donePrimary = true;
				$scope.myProId = parseInt(id);
				$scope.getTreatmentByTreatmentId($scope.tId);
			}else{
				$scope.donePrimary = false;
				 $scope.callSuccessError('error', 'Not able to make it primary');
			}
		}).error(function(data){
			var httpError = httpErrorService.httpErrorMessage(data, status);
		    $scope.callSuccessError('error', httpError);
		});
	};

	// remove a doctor from primary.
	$scope.removePrimary = function(id){
		$scope.removePrimaryObj = {
			"sessionId" : $scope.sessionId,
			"userToken" : $scope.userToken,
		    "professionalId" : id,
		    "patientId" : $scope.pId,
		    "treatmentId":$scope.tId,
		    "appointmentRequestId" : $scope.currentAppointment._id.$oid
		};

		$http.post('/zceapi/removePrimaryDoctor', $scope.removePrimaryObj).success(function(data){
			if(data.result == 'success'){
				$scope.donePrimary = false;
				$scope.myProId = 0;
				$scope.getTreatmentByTreatmentId($scope.tId);
			}else{
				$scope.donePrimary = true;
				$scope.callSuccessError('error', 'Not able to remove it from primary');
			}
		}).error(function(data){
			var httpError = httpErrorService.httpErrorMessage(data, status);
		    $scope.callSuccessError('error', httpError);
		});
	};


	// See more info like payble fees, paid fees  of added doctor in like .
	$scope.currentProfId = "0";
	$scope.showMoreInfo = function(pnl){
		$scope.currentPanelinfo = {
			"sessionId" : $scope.sessionId,
			"userToken" : $scope.userToken,
		    "professionalId" : pnl.professionalId,
		    "treatmentId":$scope.TreatmentDetail._id.$oid,
		};
		$http.post('/zceapi/getAppointmentByTreatmentIdAndProfessionalId', $scope.currentPanelinfo).success(function(data){
			if(data.appointment[0]){
				$scope.currentPayableFee = data.appointment[0].fees ? data.appointment[0].fees.feesFixed : '0';
				$scope.currentPaidFee = data.appointment[0].fees ? data.appointment[0].fees.feesPaid : '0';
				$scope.currentProfId = pnl.professionalId;
			}else{
				$scope.currentProfId = "0";
			}
		}).error(function(data){
			var httpError = httpErrorService.httpErrorMessage(data, status);
		    $scope.callSuccessError('error', httpError);
		});
	};

	// Hide more info like payble fees, paid fees  of added doctor in like .
	$scope.hideMoreInfo = function(info){
		$scope.currentProfId = "0";
	}

	// Change page .
	$scope.pageChanged = function(type) {
		if(type == 'patient'){
			$scope.indexIncrement = $scope.currentPage > 0 ? (($scope.currentPage-1)*$scope.limit): 0;
			$scope.start = $scope.limit*($scope.currentPage-1);
	        $scope.end   = $scope.limit*$scope.currentPage;
		}else{
			$scope.indexIncrement2 = $scope.currentPage2 > 0 ? (($scope.currentPage2-1)*$scope.limit): 0;
			$scope.start2 = $scope.limit*($scope.currentPage2-1);
	        $scope.end2   = $scope.limit*$scope.currentPage2;
		}
		

     };

});
angular.module('mean.system').filter('slice', function() {
  return function(arr, start, end) {
      if(arr){
          return arr.slice(start, end);
      }
  	};
});