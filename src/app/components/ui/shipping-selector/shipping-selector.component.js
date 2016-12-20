(function() {
  'use strict';

  angular
    .module('RidestoreApp')
    .component('rsShippingSelector', {
      templateUrl: 'app/components/ui/shipping-selector/shipping-selector.html',
      controller: ShippingSelectorController,
      bindings: {
        methods: '<',
        currentShippingId: '<',
      },
    });

  ShippingSelectorController.$inject = ['cart', 'checkout', 'lodash', '$rootScope'];
  function ShippingSelectorController(cart, checkout, lodash, $rootScope) {
    var $ctrl = this;

    $ctrl.toggleSelect = toggleSelect;
    $ctrl.selectMethod = selectMethod;

    ////////////////

    $ctrl.$onInit = function() { activate();};
    $ctrl.$onChanges = function(changesObj) {
      if (changesObj && changesObj.currentShippingId &&
        changesObj.currentShippingId.currentValue >= 0) {

        selectMethodByShippingId($ctrl.currentShippingId);
      }
    };
    $ctrl.$onDestroy = function() { };

    function activate() {
      $ctrl.shippingSelectorOpen = false;
    }

    function toggleSelect() {
      if ($ctrl.methods.length === 1) {
        return; //no selection on one option
      }
      $ctrl.shippingSelectorOpen = !$ctrl.shippingSelectorOpen;
    }

    function selectMethod($index) {
      $ctrl.selectedMethod = $ctrl.methods[$index];

      if ($ctrl.selectedMethod.shippingId !== $ctrl.currentShippingId) {
        var tmpCart = cart.getCart();
        checkout.setShipping(tmpCart.cartId, $ctrl.selectedMethod.shippingId).then(function () {
          //trigger the cart refresh
          $rootScope.$broadcast('cart:cartUpdated', {cart: tmpCart});
        });
      }
    }

    function selectMethodByShippingId (shippingId) {
      if (!shippingId) {
        return;
      }

      var selectedMethodIndex = lodash.findIndex($ctrl.methods, {'shippingId': shippingId});
      if (selectedMethodIndex > -1) {
        selectMethod(selectedMethodIndex);
      }
    }
  }
})();
