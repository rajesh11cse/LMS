'use strict';

angular.module('mean.articles').controller('articles-controller', function(SessionService, $log, $scope, $stateParams, $http, 
  $location, Global, $timeout, $sce, $window, Upload, Articles, toaster, spinnerService, httpErrorService) {
    $scope.getUsetype = SessionService.getSession('usertype');
    $scope.limit                = 9;  
    $scope.currentPage          = 1; 
    $scope.maxSize              = 5;
    $scope.showArticle          = false;
    $scope.trustAsHtmlCall      = true;


  // Fuction callSuccessError to show sucees or error message /
    $scope.callSuccessError = function(type, title){
     // $('html, body').animate({scrollTop: 0}, 'slow');//Go back to top.
      toaster.pop({type: type, title: title});// Dispay a flash on brower along with title(message).
    };
    
  // Show the the list of articles
    $scope.getArticleForAdmin = function(limit, pageNumber) {
      spinnerService.show('articleSpinner');
      var myArticle = $http.post('/articles/getArticleForAdmin', {'limit':limit, 'pageNumber':pageNumber});
      myArticle.success(function(data){
        if(data.result==='Success' && data.data[1] > 0){  
          $scope.articles = data.data[0];
          $scope.totalArticles = data.data[1];
          $scope.showArticle = true;
        }else{
          $scope.showArticle = false;
          $scope.callSuccessError('error', 'No article found in database');
        }     
        spinnerService.hide('articleSpinner');  
      }).error(function (data, status){
          spinnerService.hide('articleSpinner');
          var httpError = httpErrorService.httpErrorMessage(data, status);
          $scope.callSuccessError('error', httpError);
      });
    };

  //Show all information for a selected article
    $scope.viewFullArticle  = function(arts){
        $scope.currentSelectedArticle = arts;
        $scope.audioss = $sce.trustAsResourceUrl(arts.audios ? arts.audios.sourceURL:undefined);
        $scope.currentSelectedArticle['description'] = $sce.trustAsHtml(arts.description.toString());
        $scope.trustAsHtmlCall = false;
    }

  // Go for create new article 
    $scope.goToCreate = function() {
      localStorage.clear();
      $location.path('/articles/addArticles');
    };
  
  // Edit selected article 
    $scope.editArticle = function(article, description) {
      localStorage.setItem("updateArticle", JSON.stringify(article));
      localStorage.setItem("uploadedImageObj", JSON.stringify(article.images));
      localStorage.setItem("uploadedAudioObj", JSON.stringify(article.audios));
      localStorage.setItem("uploadedVideoObj", JSON.stringify(article.videos));
      localStorage.setItem("uploadedRefObj", JSON.stringify(article.references))
      localStorage.setItem("updateArticleDescription", description)
      $location.path('/articles/addArticles');
      
    };

  // Remove an selected article from Db 
    $scope.removeArticle = function(article) {
      if(window.confirm("Are you sure you want to delete this article ?")){
        var articles = {'id': article._id, limit:$scope.limit, pageNumber:$scope.currentPage};
        $http.post('/articles/removeArticle', articles).success(function (data){
          if(data.result==='Success' && data.data[1]>1){
            $scope.articles = data.data[0];
            $scope.totalArticles = data.data[1];
            $scope.showArticle = true;
            $scope.callSuccessError('success', 'Article has been removed successfully !');
            if(data.count == 0){
              $scope.callSuccessError('error', 'No article found in database.');
            }
          }else{
            $scope.showArticle = false;
            $scope.callSuccessError('error', 'Service Unavailable.'); 
          }       
        }).error(function (data, status){
            var httpError = httpErrorService.httpErrorMessage(data, status);
            $scope.callSuccessError('error', httpError);
        });
      }
    };

  // Publish article to All, Individuals or Professionals 
    $scope.publishArticle = function(article, userType){
      if(article == undefined || userType == undefined || userType == '')return;
      if($window.confirm('Are you sure you want to publish selected article to '+userType+' ?')){
        var pubArticlesObj = {
          'article'     :  article._id, 
          'userType'    :  userType,
          'title'       :  article.title,
          'description' :  article.description,
          'authorName'  :  article.authorName,
          'image'       :  article.images != null ? article.images._id : undefined,
          'limit'       :  $scope.limit, 
          'pageNumber'  :  $scope.currentPage
        };
        $http.post('/articles/publishArticle', pubArticlesObj).success(function (data){
          if(data.result==='Success' && data.data[1] > 0){
            $scope.articles = data.data[0];
            $scope.totalArticles = data.data[1];
            $scope.callSuccessError('success', 'Article published sucessfully !');
          }else{
           $scope.callSuccessError('error','Service Unavailable.');
          }       
        }).error(function (data, status){
          var httpError = httpErrorService.httpErrorMessage(data, status);
          $scope.callSuccessError('error', httpError);
        });
      }
    }

  // Check user is authenticated or not 
    if((SessionService.getSession('Authenticate') == 'true')){
        //$scope.getArticleForAdmin($scope.limit, $scope.currentPage);
    }

  // Pagination to get articles by limit and page number. 
    $scope.pageChanged = function() {
      $scope.getArticleForAdmin($scope.limit, $scope.currentPage);
    };

  }).directive('youtubevideos', function($sce) {// Directive for videos
    return {
      restrict: 'AEC',
      replace: true,
      template: '<iframe src="{{youtubeurl}}" frameborder="0" allowfullscreen width="400" height="190"></iframe>',
      link: function (scope,element, attrs) {
        scope.youtubeurl = $sce.trustAsResourceUrl(attrs.code);
      }
    };
  }).directive('youtubeaudios', function($sce) {// Directive for audios
    return {
    restrict: 'AEC',
    replace: true,
    template: '<audio controls style="width: 400px; color:white; background-color:black;"><source src="{{url}}"></audio>',
    link: function (scope,element, attrs) {
      scope.url = $sce.trustAsResourceUrl(attrs.code);
    }
  };
})
