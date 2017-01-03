(function () {
  'use strict';

  angular
    .module('mean.lms')
    .factory('Lms', Lms);

  Lms.$inject = [];

  function Lms() {
    return {
      name: 'lms'
    };
  }
})();
