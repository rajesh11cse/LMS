'use strict';

angular.module('mean.articles').controller('add-articles-controller', function(SessionService, $log, $scope, $stateParams, 
  $http, $location, Global, $timeout, $sce, $window, Upload, Articles, toaster, httpErrorService, spinnerService) {

  $scope.artAttributs          = {};// initialize article attributs or params as empty object 
  $scope.artImageAttributs     = {};// initialize image attributs or params as empty object 
  $scope.artAudioAttributs     = {};// initialize audio attributs or params as empty object 
  $scope.artVideoAttributs     = {};// initialize video attributs or params as empty object 
  $scope.artReferenceAttributs = {};// initialize reference attributs or params as empty object 
  $scope.limit                 = 9; // initialize limit for pagination 
  $scope.currentPage           = 1; // initialize page number for pagination 
  $scope.maxSize               = 5; // initialize maximum size of pages for pagination 


  
  // show Spinner on current page load 
  $scope.callToSpinner = function(){
    spinnerService.show('artSpinner');
  }

  // load tinymice on page load 
  $scope.tinymceOptions = {
    // calback when tinymice successfully loaded. 
    init_instance_callback : function(editor) {
      // hide Spinner. 
      spinnerService.hide('artSpinner'); 
    },
    inline: false,
    height : 220,
    theme: 'modern',
    plugins: [
    'advlist autolink lists link image charmap print preview hr anchor pagebreak',
    'searchreplace wordcount visualblocks visualchars code fullscreen',
    'insertdatetime media nonbreaking save table contextmenu directionality',
    'emoticons template paste textcolor colorpicker textpattern imagetools'
    ],
    toolbar1: 'insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
    toolbar2: 'print preview media | forecolor backcolor emoticons',
    image_advtab: true,
    templates: [
    { title: 'Test template 1', content: 'Test 1' },
    { title: 'Test template 2', content: 'Test 2' }
    ],
    content_css: [
    '//fonts.googleapis.com/css?family=Lato:300,300i,400,400i',
    '//www.tinymce.com/css/codepen.min.css'
    ] 
  };

  // Recieve current article JSON from local storage to update it //
  $scope.updateArticle     = JSON.parse(localStorage.getItem('updateArticle'));
  $scope.updateArticleDec     = localStorage.getItem('updateArticleDescription');

  if($scope.updateArticle){
    $scope.artAttributs = httpErrorService.getFormParameters('article', $scope.updateArticle);
    if($scope.updateArticle.images){
      $scope.showImage = true;
    }
    if($scope.updateArticle.videos){
      $scope.showVideo = true;
    }
    if($scope.updateArticle.audios){
      $scope.showAudio = true;
    }
    $scope.artAttributs.description = $scope.updateArticleDec;

  }

  // Recieve current image article from local storage ///
  $scope.uploadedImageObj     = JSON.parse(localStorage.getItem('uploadedImageObj'));
  if($scope.uploadedImageObj){
    if($scope.uploadedImageObj.largeImageUrl){
      $scope.imageURL           = $scope.uploadedImageObj.largeImageUrl ? $scope.uploadedImageObj.largeImageUrl:''
      $scope.showImageURL       = true;
    }
    $scope.showImageRemoved   = true;
    $scope.imageUploaded      = true;
  }else{
    $scope.showImageURL       = false;
    $scope.imageURL           = undefined
  }

  // Recieve current audio article from local storage //
  $scope.uploadedAudioObj     = JSON.parse(localStorage.getItem('uploadedAudioObj'));
  if($scope.uploadedAudioObj){
    $scope.showAudioRemoved   = true;
    $scope.audioUploaded      = true;
  }

  // Recieve current video article from local storage //
  $scope.uploadedVideoObj     = JSON.parse(localStorage.getItem('uploadedVideoObj'));
  if($scope.uploadedVideoObj){
    $scope.showVideoRemoved   = true;
    $scope.videoUploaded      = true;
  }

  // Fuction callSuccessError to show sucees or error message //
  $scope.callSuccessError = function(type, title){
      //$('html, body').animate({scrollTop: 0}, 'slow');// Go back to top.
      toaster.pop({type: type, title: title});
    };

  // Calendar for Published date of image, reference, audio and video article //
  $scope.dateOptions = {
    formatYear: 'yy',
    maxDate: new Date(),
    startingDay: 1
  };

  $scope.openCalendar = function(calendarType) {
    $scope.popup[calendarType] = true;
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];

  $scope.popup = {article   : false, image     : false, reference : false, audio     : false, video     : false };

  // Check image file is uploading //
  $scope.onFileSelect = function($files){
    if($files){
      $scope.imageUploading = $files[0];
    }else{
      $scope.imageUploading =  undefined;
    }
  }

  // Create or update an image article //
  $scope.createOrUpdateImageArticle = function(artImageAttr) {
    if(artImageAttr.imageFile){
      $scope.uploadImage = true;
    }else{
      $scope.uploadImage = false;
    }
    var articleImageObj = httpErrorService.createObject('image', artImageAttr);
    if($scope.uploadedImageObj){
      $scope.url =  '/articles/editArticleImage';
      articleImageObj['image_id'] = $scope.uploadedImageObj ? $scope.uploadedImageObj._id:undefined
    }else{
      $scope.url =  '/articles/uploadArticleImage'
    }
    articleImageObj['uploadNew'] = $scope.uploadImage
    Upload.upload({
      url    : $scope.url,
      method : 'POST',
      file   : artImageAttr.imageFile,
      data   : articleImageObj
    }).then(function(resp){
      $scope.isImageUpadteCanceled   =  false;
      localStorage.setItem("uploadedImageObj", JSON.stringify(resp.data.data[1]));
      $scope.uploadedImageObj      =  JSON.parse(localStorage.getItem('uploadedImageObj'));
      if($scope.uploadedImageObj && $scope.uploadedImageObj.largeImageUrl){
        $scope.imageURL     =  $scope.uploadedImageObj.largeImageUrl ? $scope.uploadedImageObj.largeImageUrl:''
        $scope.showImageURL = true;
      }else{
        $scope.showImageURL = false;
        $scope.imageURL     = undefined
      }
      $scope.imageUploaded  = true;
      $scope.showImageRemoved  = true;
    },function(err){
      $scope.showProgress   = false;
      $scope.callSuccessError('error', err.data.message);
    },function(evt){
      if($scope.imageUploading){ 
        $scope.showProgress = true;
      }
      $scope.progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
      var elem = document.getElementById("myProgressBar");   
      var width = 0;
      var id = setInterval(frame, 0);
      function frame() {
        if (width >= $scope.progressPercentage) {
          clearInterval(id);
        } else {
          width++;
          elem.style.width = width + '%'; 
          document.getElementById("myProgressLabel").innerHTML = width * 1  + '%';
        }
      }
    });
}

  // reset image attributs to procced from new //
  $scope.resetImageAttributs = function(){
    $scope.artImageAttributs = undefined;
  }

  // Toggle for image update or cancel //
  $scope.editToggleArticleImage = function(){
    $scope.imageUploaded = !$scope.imageUploaded;
    $scope.isImageUpadteCanceled    = !$scope.isImageUpadteCanceled;
    $scope.updateImageNow     = true;
    $scope.showProgress  = false;
    if(!$scope.imageUploaded && $scope.uploadedImageObj){
      $scope.artImageAttributs = httpErrorService.getFormParameters('image', $scope.uploadedImageObj);
    }
  }

  // Remove an image article from Db //
  $scope.removeArticleImage = function() {
    if(window.confirm("Are you sure you want to remove this image article ?")){
      var articles = {'id': $scope.uploadedImageObj._id};
      $http.post('/articles/removeArticleImage', articles).success(function (data){
        if(data.result==='Success'){
          $scope.imageUploaded = false;
          $scope.showImage     = false;
          $scope.showImageRemoved   = true;
          localStorage.removeItem('uploadedImageObj');
          $window.location.reload();
          $scope.callSuccessError('success', 'Image Article has been removed successfully !');
        }else{
          $scope.callSuccessError('error', 'Service Unavailable.');
        }       
      }).error(function (data, status){
        var httpError = httpErrorService.httpErrorMessage(data, status);
        $scope.callSuccessError('error', httpError);
      });
    }
  };

  // Create or update an audio article //
  $scope.createOrUpdateAudioArticle = function(artAudioAttr) {
    var articleAudioObj = httpErrorService.createObject('audio', artAudioAttr);
    if($scope.uploadedAudioObj != undefined && $scope.uploadedAudioObj != null){
     var url =  '/articles/editArticleAudio'
     articleAudioObj['audio_id'] =  $scope.uploadedAudioObj._id
    }else{
     var url =  '/articles/uploadArticleAudio'
    }
  $http.post(url, articleAudioObj).success(function (data){
    if(data.result==='Success'){
      $scope.isAudioUpadteCanceled  =   false;
      localStorage.setItem("uploadedAudioObj", JSON.stringify(data.data));
      $scope.uploadedAudioObj =  JSON.parse(localStorage.getItem('uploadedAudioObj'));
      $scope.audioUploaded  =  true;
      $scope.showAudioRemoved = true;
    }else{
      $scope.callSuccessError('error', 'Service Unavailable.');
    }       
  }).error(function (data, status){
    var httpError = httpErrorService.httpErrorMessage(data, status);
    $scope.callSuccessError('error', httpError);
  });
}

  // reset audio attributs to procced from new //
  $scope.resetAudioAttributs = function(){
   $scope.artAudioAttributs = undefined;
 }

  // Toggle for audio update or cancel //
  $scope.editToggleArticleAudio = function(){
    $scope.audioUploaded = !$scope.audioUploaded;
    $scope.isAudioUpadteCanceled    = !$scope.isAudioUpadteCanceled;
    $scope.updateAudioNow     = true;
    if(!$scope.audioUploaded && $scope.uploadedAudioObj){
      $scope.artAudioAttributs = httpErrorService.getFormParameters('audio', $scope.uploadedAudioObj);
   }
 }

  // Remove an audio article from Db //
  $scope.removeArticleAudio = function() {
    if(window.confirm("Are you sure you want to remove this audio article ?")){
      var articles = {'id': $scope.uploadedAudioObj._id};
      $http.post('/articles/removeArticleAudio', articles).success(function (data){
        if(data.result==='Success'){
          $scope.audioUploaded = false;
          $scope.showAudio     = false;
          $scope.showAudioRemoved = true;
          localStorage.removeItem('uploadedAudioObj');
          $window.location.reload();
          $scope.callSuccessError('success', 'Audio Article has been removed successfully !');
        }else{
          $scope.callSuccessError('error', 'Service Unavailable.');
        }       
      }).error(function (data, status){
        var httpError = httpErrorService.httpErrorMessage(data, status);
        $scope.callSuccessError('error', httpError);
      });
    }
  };

  // Create or update an video article //
  $scope.createOrUpdateVideoArticle = function(artVideoAttr) {
    var articleVideoObj = httpErrorService.createObject('video', artVideoAttr);
    if($scope.uploadedVideoObj){
      var url =  '/articles/editArticleVideo'
      articleVideoObj['video_id'] = $scope.uploadedVideoObj._id
    }else{
      var url =  '/articles/uploadArticleVideo'
    }
   
  $http.post(url, articleVideoObj).success(function (data){
    if(data.result==='Success'){
      $scope.isVideoUpadteCanceled  =   false;
      localStorage.setItem("uploadedVideoObj", JSON.stringify(data.data));
      $scope.uploadedVideoObj =  JSON.parse(localStorage.getItem('uploadedVideoObj'));
      $scope.videoUploaded  =  true;
      $scope.showVideoRemoved = true;
    }else{
      $scope.callSuccessError('error', 'Service Unavailable.');
    }       
  }).error(function (data, status){
    var httpError = httpErrorService.httpErrorMessage(data, status);
    $scope.callSuccessError('error', httpError);
  });
}

  // reset video attributs to procced from new //
  $scope.resetVideoAttributs = function(){
   $scope.artVideoAttributs  = undefined;
 }

  // Toggle for video update or cancel //
  $scope.uploadedVideoOb = [0]
  $scope.editToggleArticleVideo = function(){
    $scope.videoUploaded = !$scope.videoUploaded;
    $scope.isVideoUpadteCanceled    = !$scope.isVideoUpadteCanceled;
    $scope.updateVideoNow     = true;
    if(!$scope.videoUploaded && $scope.uploadedVideoObj){
      $scope.artVideoAttributs = httpErrorService.getFormParameters('video', $scope.uploadedVideoObj);
   }
 }

  // Remove an video article from Db //
  $scope.removeArticleVideo = function() {
    if(window.confirm("Are you sure you want to remove this video article ?")){
      var articles = {'id': $scope.uploadedVideoObj._id};
      $http.post('/articles/removeArticleVideo', articles).success(function (data){
        if(data.result==='Success'){
          $scope.videoUploaded = false;
          $scope.showVideo     = false;
          $scope.showVideoRemoved = true;
          localStorage.removeItem('uploadedVideoObj');
          $window.location.reload();
          $scope.callSuccessError('success', 'Video Article has been removed successfully !');
        }else{
          $scope.callSuccessError('error', 'Service Unavailable.');
        }       
      }).error(function (data, status){
        var httpError = httpErrorService.httpErrorMessage(data, status);
        $scope.callSuccessError('error', httpError);
      });
    }
  };

  // Update a refereance article //
  $scope.goToUpdateRefArticle = function(ref, index) {
    $scope.showReference = true;
    $scope.updateRefNow = true;
    $scope.currentRefId = ref._id;
    $scope.refIndex = index;
    $scope.artReferenceAttributs = httpErrorService.getFormParameters('video', ref);
  }

  // Create a reference article //
  $scope.goToCreateRefArticle = function() {
    $scope.showReference = true;
    $scope.updateRefNow = false;
    $scope.artReferenceAttributs  = undefined;
  }

  $scope.referenceObj = JSON.parse(localStorage.getItem('uploadedRefObj'));
  $scope.createRefArticle = function(artRefAttr) {
    if(artRefAttr.sourceURL == undefined){
      $scope.callSuccessError('error', 'Source url is required.');
    }else{
      var url =  '/articles/addArticleReference'
      var articleRefObj = {
        'sourceURL'    :  artRefAttr.sourceURL,
        'publishedDate':  artRefAttr.publishedDate,
        'authorName'   :  artRefAttr.authorName 
      };
      $http.post(url, articleRefObj).success(function (data){
        if(data.result==='Success'){
          $scope.showReference = false;
          $scope.arr = [];
          $scope.arr.push(data.data);
          if(localStorage.getItem('uploadedRefObj') && JSON.stringify(localStorage.getItem('uploadedRefObj')).length > 0){
            $scope.oldStorage = JSON.parse(localStorage.getItem('uploadedRefObj'));
            async.eachSeries($scope.oldStorage, function(os, callback){
              $scope.arr.push(os);
              callback();
            }, function(err){
              if(err){
                $scope.callSuccessError('error', err);
              }else{
                localStorage.setItem('uploadedRefObj', JSON.stringify($scope.arr));
                $scope.referenceObj = JSON.parse(localStorage.getItem('uploadedRefObj'));
              }
            });
          }else{
            localStorage.setItem('uploadedRefObj', JSON.stringify($scope.arr));
            $scope.referenceObj = JSON.parse(localStorage.getItem('uploadedRefObj'));
          }
        }else{
          $scope.callSuccessError('error', 'Service Unavailable.');
        }       
      }).error(function (data, status){
        var httpError = httpErrorService.httpErrorMessage(data, status);
        $scope.callSuccessError('error', httpError);
      });
    }
  }

  // Update a reference article //
  $scope.updateRefArticle = function(artRefAttr) {
    if(artRefAttr.sourceURL == undefined){
      $scope.callSuccessError('error', 'Source url is required.');
    }else{
      var url =  '/articles/editArticleReference'
      var articleRefObj = {
        'id'           :  $scope.currentRefId,
        'sourceURL'    :  artRefAttr.sourceURL,
        'publishedDate':  artRefAttr.publishedDate,
        'authorName'   :  artRefAttr.authorName 
      };

      $http.post(url, articleRefObj).success(function (data){
        if(data.result==='Success'){
          $scope.showReference = false;
          $scope.oldStorage = JSON.parse(localStorage.getItem('uploadedRefObj'));
          $scope.oldStorage[$scope.refIndex] = data.data;
          localStorage.setItem('uploadedRefObj', JSON.stringify($scope.oldStorage));
          $scope.referenceObj = JSON.parse(localStorage.getItem('uploadedRefObj'));
          $scope.callSuccessError('success', 'Updated successfully !');
        }else{
          $scope.callSuccessError('error', 'Service Unavailable.');
        }       
      }).error(function (data, status){
        var httpError = httpErrorService.httpErrorMessage(data, status);
        $scope.callSuccessError('error', httpError);
      });
    }
  }

  // Remove a refereance article //
  $scope.removeRefArticle = function(id, index) {
    $http.post('/articles/removeArticleReference', {id:id}).success(function (data){
      if(data.result === 'Success'){
        $scope.showReference = false;
        $scope.oldStorage = JSON.parse(localStorage.getItem('uploadedRefObj'));
        $scope.oldStorage.splice(index, 1);
        localStorage.setItem('uploadedRefObj', JSON.stringify($scope.oldStorage));
        $scope.referenceObj = JSON.parse(localStorage.getItem('uploadedRefObj'));
        $scope.callSuccessError('success', 'Removed successfully !');
      }else{
        $scope.callSuccessError('error', 'Service Unavailable.');
      }
    }).error(function (data, status){
      var httpError = httpErrorService.httpErrorMessage(data, status);
      $scope.callSuccessError('error', httpError);
    });
  }  

  // Create or Update an article //
  $scope.createArticle = function(artAttributs, artReferenceAttributs) {
    var articleObj = httpErrorService.createObject('article', artAttributs);
      articleObj['status']      =   artAttributs.articleStatus,
      //Check the type of description, For string it gives the char code 155 else
      //Will give 98 for Object or Array
      articleObj['description'] =  (typeof artAttributs.description).toString().charCodeAt() === 115 ? artAttributs.description : $scope.updateArticleDec,      
      articleObj['images']      =  $scope.imageUploaded == true ? JSON.parse(localStorage.getItem('uploadedImageObj'))._id : null,
      articleObj['videos']      =  $scope.videoUploaded == true ? JSON.parse(localStorage.getItem('uploadedVideoObj'))._id : null,
      articleObj['audios']      =  $scope.audioUploaded == true ? JSON.parse(localStorage.getItem('uploadedAudioObj'))._id : null,
      articleObj['references']  =  $scope.referenceObj


    if($scope.updateArticle != null){
      var url =  '/articles/editArticle';
      var msg = 'updated';
      articleObj['id'] = $scope.updateArticle._id;
    }else{
      var msg = 'created';
      var url =  '/articles/createArticle'
    }
    $http.post(url, articleObj).success(function (data){
      if(data.result==='Success'){
        $scope.callSuccessError('success', 'Article has been '+msg+' successfully !');
        $timeout(function(){
          $location.path('/articles')
        }, 1500);
      }else{
        $scope.callSuccessError('error', 'Service Unavailable.');
      }
    }).error(function (data, status){
      var httpError = httpErrorService.httpErrorMessage(data, status);
      $scope.callSuccessError('error', httpError);
    });
  };

  // Cancel create article //
  $scope.cancelCreateArticle = function() {
    if(window.confirm("Are you sure you want to cancel the article ?")){
      if($scope.updateArticle != null){
        $location.path('/articles');
      }else if($scope.uploadedImageObj || $scope.uploadedAudioObj || $scope.uploadedVideoObj || $scope.uploadedRefObj){
        $scope.callSuccessError('error', 'Please remove image, audio, vidio or reference article first that you created else complete the article.!')
      }else{
        $location.path('/articles');
      }
    }
  };
}
);
