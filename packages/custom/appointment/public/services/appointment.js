(function () {
  'use strict';

  angular
    .module('mean.appointment')
    .factory('Appointment', Appointment);

  Appointment.$inject = [];

  function Appointment() {
    return {
      name: 'appointment'
    };
  }
})();
