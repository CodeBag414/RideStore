(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('NotFoundController', NotFoundController);

  NotFoundController.$inject = ['topFactory'];

  function NotFoundController(topFactory) {

    var vm = this;
    var callback = 'JSON_CALLBACK';

  }

})();
