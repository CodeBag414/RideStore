(function() {
  'use strict';

  /**
  * @desc cart product list to be used accross the app that displays the
  *    cart items
  * @example <rs-cart-product-list hide-remove-buttons="true"></rs-cart-product-list>
  *
  * @param {boolean} [hide-remove-buttons] optional parameter that hides the remove buttons from the elemens
  */
  angular
    .module('RidestoreApp')
    .component('rsCartProductList', {
      templateUrl: 'app/components/cart/cart-product-list/cart-product-list.html',
      controller: CartProductListController,
      bindings: {
        hideRemoveButtons: '<?',
      },
    });

  CartProductListController.$inject = ['cart', 'head', '$scope', '$state'];

  function CartProductListController(cart, head, $scope, $state) {
    var $ctrl = this;

    $ctrl.cart = cart.getCart();
    $ctrl.hideRemoveButtons = $scope.$ctrl.hideRemoveButtons;

    $ctrl.changeQuantity = changeQuantity;
    $ctrl.changeQuantityCallback = changeQuantityCallback;
    $ctrl.isCartProductAGiftcard = cart.isCartProductAGiftcard;
    $ctrl.removeFromCart = removeFromCart;
    $ctrl.showErrorMessage = false;
    $ctrl.setNewQuantity = setNewQuantity;

    $ctrl.isFirefox = head.isFirefox;

    ////////////////

    $ctrl.$onInit = activate();
    $ctrl.$onChanges = function(changesObj) { };
    $ctrl.$onDestroy = function() { };

    ////////////////

    function activate() {
      //listen to broadcast event on update of cart
      $scope.$on('cart:cartUpdated', function (event, args) {
        //do something if needed
        $ctrl.showErrorMessage = false;
        $ctrl.cart = cart.getCart();
      });

      $scope.$on('cart:couldNotChangeQuantity', function(reason) {
        $ctrl.showErrorMessage = true;
      });
    }

    function changeQuantity(product, qtyChange) {
      var newQuantity = product.quantity + qtyChange;
      var updateCheckout = false;
      if ($state.current.name === 'checkout') {
        updateCheckout = true;
      }

      cart.changeQuantity(product['quote_item'], newQuantity, updateCheckout);
    }

    function setNewQuantity(product, quantity) {
      cart.changeQuantity(product['quote_item'], quantity, false);
    }

    function changeQuantityCallback(product, quantityChange) {
      changeQuantity(product, quantityChange);
      $ctrl.changingQuantity = true;
    }

    function removeFromCart(product) {
      cart.removeFromCart(product, false);
    }

  }
})();
