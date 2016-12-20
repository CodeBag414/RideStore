(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('CartController', CartController);

  CartController.$inject = ['topFactory', 'cart', 'checkout', 'head', '$state', '$scope'];

  function CartController(topFactory, cart, checkout, head, $state, $scope) {

    window.performanceMark('CartController:start');

    var vm = this;

    vm.top = topFactory;
    vm.checkoutService = checkout;
    vm.head = head;

    vm.cart = cart.getCart();

    vm.goToCheckout = goToCheckout;
    vm.clearCart = clearCart;
    vm.refreshCart = refreshCart;

    activate();

    ////////////

    function activate() {
      //listen to broadcast event on update of cart
      $scope.$on('cart:cartUpdated', function (event, args) {
        //do something if needed
        vm.cart = cart.getCart();
        checkCartStock();
      });

      $scope.$on('cart:cartVisible', refreshCart);
    }

    function goToCheckout() {
      topFactory.toggleCart();
      $state.go('checkout');
    }

    function clearCart() {
      cart.clearCart();
      vm.cart = cart.getCart();
    }

    function refreshCart() {
      cart.refreshCart().then(function(cart) {
        vm.cart = cart;
        checkCartStock();
      });
    }

    function checkCartStock() {
      vm.allProductsInStock = cart.isAllProductsInStock();
    }

    window.performanceMark('CartController:end');

    window.performanceMeasure('CartController', 'CartController:start', 'CartController:end');

  }

})();
