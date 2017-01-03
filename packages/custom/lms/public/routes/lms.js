(function () {
  'use strict';

  angular
    .module('mean.lms')
    .config(lms);

  lms.$inject = ['$stateProvider'];

  function lms($stateProvider) {
    $stateProvider.state('lms example page', {
      url: '/lms/example',
      templateUrl: 'lms/views/index.html'
    }).state('manage books',{
      url:'/lms/manage_books',
      templateUrl:'lms/views/manage_books.html',
    });
  }

})();
