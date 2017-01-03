(function () {
  'use strict';

  /* jshint -W098 */
  angular
    .module('mean.lms')
    .controller('LmsController', LmsController);

  LmsController.$inject = ['$scope', 'Global', 'Lms'];

  function LmsController($scope, Global, Lms) {
    $scope.global = Global;
    $scope.package = {
      name: 'lms'
    };
  }
})();