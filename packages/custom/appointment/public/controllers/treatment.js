angular.module('mean.system').controller('treatmentCtrl', function(SessionService, $scope, $stateParams, Global,$http) {

    $scope.userToken = SessionService.getSession('userToken');
    $scope.sessionId = SessionService.getSession('sessionId');

    $scope.getTreatmentByPatientId = function(id){

    	$scope.treatmentObj = {
			"sessionId": "327614",
    		"userToken" : "4ayzWddbUYNTae92",
    		"patientId":"574d8f960ee8dfba8e102d60"
		};

    	$http.post('/zceapi/getPatients', $scope.treatmentObj).success(function(data){
    		console.log(data);
		});

    }

    $scope.getTreatmentByPatientId();

});