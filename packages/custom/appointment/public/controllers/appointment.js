(function () {
  'use strict';

  /* jshint -W098 */
  angular
    .module('mean.appointment')
    .controller('AppointmentController', AppointmentController);

  AppointmentController.$inject = ['$scope', 'Global', 'Appointment'];

  function AppointmentController($scope, Global, Appointment) {
    $scope.global = Global;
    $scope.package = {
      name: 'appointment'
    };
  }
})();