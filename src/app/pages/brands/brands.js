(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('BrandsController', BrandsController);

  BrandsController.$inject = ['api', 'head', '$window', 'gettext'];

  function BrandsController(api, head, $window, gettext) {

    var vm = this;
    vm.head = head;

    var endpointUrl = 'brands';
    api.performJsonpRequest(endpointUrl)
      .then(function(res) {
        vm.brandsJson = res.data.data;
      }, function(reason) {
        var message = gettext('Error loading brands.');
        api.displayErrorToast(message, reason);
      });

    vm.alphabet = ['0-9'].concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
    vm.alphabetCharHeight = Math.round(100 * 100.0 / vm.alphabet.length) / 100;

    vm.isSearching = false;

    angular.element($window).bind('scroll', function() {

      //check if a fucking div is visble..
      //$scope.$digest();

    });

  }

})();
