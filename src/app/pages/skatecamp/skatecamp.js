(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('SkatecampController', SkatecampController);

  SkatecampController.$inject = ['head', 'instantCheckoutService', '$state', '$uibModal'];

  function SkatecampController(head, instantCheckoutService, $state, $uibModal) {

    var vm = this;
    vm.head = head;
    vm.productId = 300652;
    vm.sendDetails = sendDetails;


    /**
     * @ngdoc function
     * @name openInstantCheckout
     * @description
     *  opens a klarna checkout modal
     */
    function openInstantCheckout(cartId) {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/pages/instant-checkout/instant-checkout-modal/instant-checkout-modal.html',
        controller: 'InstantCheckoutModalController',
        controllerAs: 'ICModalController',

        resolve: {
          cartId: function() {
            return cartId;
          },
          checkoutStage: function() {
            return 'checkout';
          }
        },
      });

      modalInstance.result.then(function (returnedValue) {
        // on modal success
        $state.go('home');
      }, function () {
        // on modal dismiss
        $state.go('home');
      });
    }

    function showErrorAddingToCart(status) {
      vm.errorAddingToCart = true;
      console.error('errorAddingToCart', status);
    }

    function doInstantCheckout() {
      instantCheckoutService.instantCheckout(vm.productId, vm.options)
      .then(function(res) {
        if (res.status === 'success') {
          openInstantCheckout(res.cartId);
        } else {
          showErrorAddingToCart(status);
        }
      });
    }

    function sendDetails() {
    	vm.options = JSON.stringify(vm.details);
    	doInstantCheckout();
    }
  }
})();
