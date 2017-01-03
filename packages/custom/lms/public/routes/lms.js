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
    }).state('manage users',{
      url:'/lms/manage_users',
      templateUrl:'lms/views/manage_users.html',
    }).state('issue return books',{
      url:'/lms/issue_return_books',
      templateUrl:'lms/views/issue_return_books.html',
    });
  }

})();
