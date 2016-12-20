/**
* Configurable product
*
* Ridestore AB
*/
(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('StickersController', StickersController);

  StickersController.$inject = ['topFactory'];

  function StickersController (topFactory) {

    var vm = this;
    var callback = 'JSON_CALLBACK';

    topFactory.setState('transparent-white logo');
  }

})();
