(function() {
  'use strict';

  angular
    .module('RidestoreApp')
    .component('instantCheckout', {
      templateUrl: 'app/pages/start/start.html',
      controller: InstantCheckoutController,
    });

  InstantCheckoutController.$inject = ['instantCheckoutService',
      '$location', '$state', '$stateParams', '$uibModal'];
  function InstantCheckoutController(instantCheckoutService,
      $location, $state, $stateParams, $uibModal) {
    var $ctrl = this;

    ////////////////

    $ctrl.$onInit = activate();
    $ctrl.$onChanges = function(changesObj) { };
    $ctrl.$onDestroy = function() { };

    ////////////////

    function activate() {
      if (isInstantCheckout()) {
        $ctrl.productId = $stateParams.productId ? $stateParams.productId : null;
        $ctrl.options = $stateParams.options ? angular.fromJson($stateParams.options) : {};

        if ($ctrl.productId) {
          doInstantCheckout();
        }
      }

      if (isInstantCheckoutSuccess()) {
        $ctrl.cartId = $stateParams.cartId ? $stateParams.cartId : null;

        if ($ctrl.cartId) {
          openSuccessModal();
        }
      }
    }

    /**
     * @ngdoc function
     * @name doInstantCheckout
     * @description
     *  for virtual cards only, we perform an instant klarna checkout
     */
    function doInstantCheckout() {
      instantCheckoutService.instantCheckout($ctrl.productId, $ctrl.options)
      .then(function(res) {
        if (res.status === 'success') {
          openInstantCheckout(res.cartId);
        } else {
          showErrorAddingToCart(status);
        }
      });
    }

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

    /**
     * @ngdoc function
     * @name openSuccessModal
     * @description
     *  opens a klarna success modal
     */
    function openSuccessModal() {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/pages/instant-checkout/instant-checkout-modal/instant-checkout-modal.html',
        controller: 'InstantCheckoutModalController',
        controllerAs: 'ICModalController',

        resolve: {
          cartId: function() {
            return $ctrl.cartId;
          },
          checkoutStage: function() {
            return 'success';
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
      $ctrl.errorAddingToCart = true;
      console.error('errorAddingToCart', status);
    }

    function isInstantCheckoutSuccess() {
      return $state.current.name === 'instant-checkout-success';
    }

    function isInstantCheckout() {
      return $state.current.name === 'instant-checkout';
    }
  }
})();
