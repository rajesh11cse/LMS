'use strict';

angular.module('mean.system').controller('issue_return_books_Ctrl',['SessionService', '$scope','$http','Global', 'toaster', 'httpErrorService', 'spinnerService', '$location',
	function(SessionService, $scope, $http, Global, toaster, httpErrorService, spinnerService, $location){
	    $scope.limit                =5;  
	    $scope.currentPage          = 1;
	    $scope.maxSize              = 5;
	    $scope.show_books           = false;
	    $scope.show_books_form      = false;
	    $scope.user                 = {};// initialize user attributs or params as empty object 


	     $scope.welcome_To_Dashboard = function(){ 
			spinnerService.show('welcomePageSpinner');
			spinnerService.hide('welcomePageSpinner');
		}

		// Fuction callSuccessError to show sucees or error message /
	    $scope.callSuccessError = function(type, title){
	      toaster.pop({type: type, title: title});// Dispay a flash on brower along with title(message).
	    };

	 //>>>>>>>>>>>>>>>>> Calendar for Date of Birth >>>>>>>>>>>>>>//
	    $scope.today = function() {
	  		$scope.dueDate = new Date();
	    };
	    $scope.today();
	    $scope.dateOptions = {
	      	formatYear: 'yy',
	      	minDate: new Date(),
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

    
    	// Search user by name and mobile number
		$scope.search_user = function(search){
			$scope.showPatientDetail = false;
			if(search.length>2){
		      if(search.match("^[(0-9)]"+".*")){
		        var patient_promie = $http.get('/api/lms/search_user?userName=&mobileNumber='+search);
		          patient_promie.success(function (response){
		          	if(response.result == 'Success' && response.data.length>0){
		          		$scope.users_list = response.data;
		          		$scope.showTable = true;
		          		$scope.user_found = false;
		          	}else{
		          		$scope.showTable = false;
						$scope.user_found = true;
			        }
		        }).error(function(data){
					var httpError = httpErrorService.httpErrorMessage(data, status);
				    $scope.callSuccessError('error', httpError);
				});
		      } else {
		        var patient_promie = $http.get('/api/lms/search_user?userName='+search+'&mobileNumber=');
		          patient_promie.success(function (response){
		            if(response.result == 'Success' && response.data.length>0){
		          		$scope.users_list = response.data;
		          		$scope.showTable = true;
		          		$scope.user_found = false;
		          	}else{
		          		$scope.showTable = false;
						$scope.user_found = true;
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
		 // Select user for issue/return book
		$scope.select_user = function(data){
			$scope.selected_user = data;
			$scope.showTable = false;
			$scope.show_user_detail = true;
		};

		// Issue a book.
		$scope.issue_books = function(book_info){
			var params = {
				'user_id'		:  $scope.selected_user._id, 
				'book_detail'   :  book_info, 
				'dueDate'		:  $scope.dueDate,
			}
			$http.post('/api/lms/issue_book', params).success(function(data){
				if(data.result == 'Success'){
					$scope.show_issue_book_form = false;
					$scope.callSuccessError('success', 'Book has been issued successfully');
				}else{
	      			$scope.callSuccessError('error', 'Not able to issue the book.');
				}
			}).error(function (data, status){
	          	var httpError = httpErrorService.httpErrorMessage(data, status);
	         	$scope.callSuccessError('error', httpError);
			});
		}
		// Return a book.
		$scope.return_books = function(book_info){
			var params = {
				'user_id'		:  $scope.selected_user._id, 
				'book_detail'   :  book_info, 
			}
			$http.post('/api/lms/return_book', params).success(function(data){
				if(data.result == 'Success'){
					$scope.show_return_book_form = false;
					$scope.callSuccessError('success', 'Book has been returned successfully');
				}else{
	      			$scope.callSuccessError('error', 'Not able to return the book.');
				}
			}).error(function (data, status){
	          	var httpError = httpErrorService.httpErrorMessage(data, status);
	         	$scope.callSuccessError('error', httpError);
			});
		}


		$scope.pageChanged = function() {
           $scope.get_all_books($scope.limit, $scope.currentPage);
	     };

	}]);