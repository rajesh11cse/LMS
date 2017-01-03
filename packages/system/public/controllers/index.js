'use strict';

angular.module('mean.system').controller('IndexController', ['$scope','$http', 'SessionService','$rootScope','Global', '$location',
  function($scope, $http, SessionService, $rootScope, Global, $location) {
    $scope.global = Global;
    $scope.sites = {
      'makeapoint':{
        'name':'makeapoint',
        'text':'Makeapoint is a platform to craft and fine-tune ideas and messages providing a graphical experience which brough an offline methodlogy online',
        'author':'Linnovate',
        'link':'http://www.linnovate.net',
        'image':'/theme/assets/img/makeapoint.png'
      },
      'intranet':{
        'name':'Intranet',
        'text':'Enterpintranet',
        'author':'qed42',
        'link':'http://www.qed42.com',
        'image':''
      }
    };
    $scope.packages = {
      'gmap':{
        'name':'gmap',
        'text':'gmap lets you add geographical information to your applications objects',
        'author':'linnovate',
        'link':'http://www.qed42.com',
        'image':'/theme/assets/img/gmap.png'
      },
      'upload':{
        'name':'Upload',
        'text':'hello text',
        'author':'Linnovate',
        'link':'http://www.linnovate.net',
        'image':'http://cdn.designbyhumans.com/pictures/blog/09-2013/pop-culture-cats/Pop_Culture_Cats_Hamilton_Hipster.jpg'
      },
      'socket':{
        'name':'Socket',
        'text':'Socket.io support',
        'author':'Linnovate',
        'link':'http://www.linnovate.net',
        'image':'http://cdn.designbyhumans.com/pictures/blog/09-2013/pop-culture-cats/Pop_Culture_Cats_Hamilton_Hipster.jpg'
      }
    };

    $scope.login = function(){
     async.waterfall([
      function(callback){
        $http.post('/login', {email: $scope.user.email, password: $scope.user.password, userName: $scope.user.username }).success(function(data){
          if(data.result == 'Success'){
            var str = "";                                         // String result
            for(var i=0; i<16; i++){                              // Loop `16` times
              var rand = Math.floor( Math.random() * 62 );        // random: 0..61
              var charCode = rand+= rand>9? (rand<36?55:61) : 48; // Get correct charCode
              str += String.fromCharCode( charCode );             // add Character to str
            }
            //$http.post('zceapi/upsertUserToken',{userToken : str, userId : data.data._id.toString()}).success(function(tokenResponse){
              callback(false, data.data, '')
           // });
           // callback(false, data.data, str)
          }else{
            $scope.showPassworderror = true;
            $scope.passworderror = data.message;
             callback(true, null)
          }
        }).error(function(data){
          $scope.showPassworderror = true;
          $scope.passworderror = data.message;
          callback(true, null)
        });
        
      },

      function(user, userToken, callback){
        $http.put('/updateUserToken', {id:user._id, userToken:userToken}).success(function(data){
            SessionService.setSession('sessionId', user._id);
            SessionService.setSession('userToken', userToken);
            callback(false, user)
        }).error(function(){
          callback(false, user)
        });
      }
      ], function(err, finalUser){
          if(err) {
            console.log(err);
          }else{
            $rootScope.user=finalUser;
            $rootScope.$emit('loggedin');
            SessionService.setSession('Authenticate', 'true');
            SessionService.setSession('username', finalUser.username);
            SessionService.setSession('usertype', finalUser.type);
            $location.path('/superadminlogin');
          }
      });
    }
    $scope.$watch(function () {
      for (var i = 0; i < $scope.sites.length; i+=1) {
        if ($scope.sites[i].active) {
          return $scope.sites[i];
        }
      }
    }, function (currentSlide, previousSlide) {
      if (currentSlide !== previousSlide) {
        console.log('currentSlide:', currentSlide);
      }
    });
  }
]);
