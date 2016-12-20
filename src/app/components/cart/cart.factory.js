/**
* Ridestore cart factory service
*
* Ridestore AB
*/
(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('cart', cart);

  cart.$inject = ['$q', '$rootScope', 'api', 'storageService', 'lodash', 'gettext',
    'rsConfig'];

  function cart($q, $rootScope, api, storageService, lodash, gettext, rsConfig) {

    var cart = initCart();
    if (cart.cartId) {
      refreshCart();
    }

    return {
      addToCart: addToCart,
      addGiftcardToCart: addGiftcardToCart,
      changeQuantity: changeQuantity,
      clearCart: clearCart,
      getCart : getCart,
      getCartItemsCount: getCartItemsCount,
      reInitCart: reInitCart,
      refreshCart: refreshCart,
      removeFromCart: removeFromCart,
      isCartProductAGiftcard: isCartProductAGiftcard,
      isAllProductsInStock: isAllProductsInStock,
    };

    ////////////

    function initCart() {
      var emptyCart = {
        cartId: '',
        products: [],
        totalSum: 0,
        items: 0
      };
      if (storageService.get('cart')) {
        emptyCart.cartId = storageService.get('cart');
      }
      return lodash.clone(emptyCart);
    }

    function addToCart(configId, simpleId) {
      var cartRoute = '';
      if (cart.cartId) {
        cartRoute = cart.cartId + '/';
      }

      var endpointUrl = 'carts/' +
        cartRoute + 'add/product/' +
        configId + '/' + simpleId;

      return api.performJsonpRequest(endpointUrl, null, false)
        .then(function(res) {
          updateCart(res.data);
          return {status: 'success', cartId: res.data.cartId, configId: configId};
        }, function(reason) {
          var message = gettext('Error adding products to cart.');
          api.displayErrorToast(message, reason);
          return 'error';
        });
    }

    function addGiftcardToCart(options) {
      var cartRoute = '';
      if (cart.cartId) {
        cartRoute = cart.cartId + '/';
      }

      if (cartHasGiftcard()) {
        var message = gettext('Could not add another giftcard to your cart.');
        message += ' ';
        message += gettext('Finalize the current purchase first');

        return $q.reject(message);
      }

      var endpointUrl = 'carts/' +
        cartRoute + 'add/product/' +
        rsConfig.giftcard.methods.physical.id;

      var params = {
        options: options
      };

      return api.performJsonpRequest(endpointUrl, params, false)
        .then(function(res) {
          updateCart(res.data);
          return {status: 'success', cartId: res.data.cartId, configId: rsConfig.giftcard.methods.physical.id};
        }, function(reason) {
          var message = gettext('Error adding Giftcard to cart.');
          api.displayErrorToast(message, reason);
          return 'error';
        });
    }

    function changeQuantity(quoteItemId, newQuantity, updateCheckout) {
      if (updateCheckout && window._klarnaCheckout) {
        window._klarnaCheckout(function (api) {
          api.suspend();
        });
      }

      var endpointUrl = 'carts/' +
        cart.cartId + '/update/item/' +
        quoteItemId + '/' + newQuantity;

      api.performJsonpRequest(endpointUrl, null, false)
        .then(function(res) {
          updateCart(res.data);
          if (updateCheckout && window._klarnaCheckout) {
            window._klarnaCheckout(function (api) {
              api.resume();
            });
          }
        }, function(res) {
          var reason = {
            itemId: quoteItemId,
            newQuantity: newQuantity,
            response: res
          };
          $rootScope.$broadcast('cart:couldNotChangeQuantity', reason);
        });
    }

    function clearCart() {
      storageService.remove('cart');
      cart = initCart();
      $rootScope.$broadcast('cart:cartUpdated', {cart: cart});
    }

    function getCart() {
      return cart;
    }

    function getCartItemsCount() {
      return cart.items;
    }

    /**
     * @ngdoc function
     * @name reInitCart
     * @description sets a new cartId and refreshes its content based on the
     *   existing one in the API
     *
     * @param {string} cartId
     */
    function reInitCart(cartId) {
      if (cartId) {
        cart.cartId = cartId;
        refreshCart();
      }
      return cartId;
    }

    /**
     * @ngdoc function
     * @name refreshCart
     * @description
     * refreshes the cart, or, if no cartId is set, then initiates a new cart
     *
     */
    function refreshCart() {
      var endpointUrl = 'carts/';

      if (cart.cartId) {
        endpointUrl += cart.cartId;
      }

      return api.performJsonpRequest(endpointUrl, null, false)
        .then(function(res) {
          updateCart(res.data);
          return cart;
        }, function(reason) {
          var message = gettext('Error refreshing the cart.');
          api.displayErrorToast(message, reason);
        });
    }

    function removeFromCart(product, updateCheckout) {
      //remove to product locally first for better response
      cart.products = lodash.without(cart.products, product);

      if (updateCheckout) {
        window._klarnaCheckout(function (api) {
          api.suspend();
        });
      }
      /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
      /* jshint -W106 */
      //Bug RIDEAPI-85
      var endpointUrl = 'carts/' +
        cart.cartId + '/remove/item/' + product.quote_item;
      /* jshint +W106 */
      /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */

      api.performJsonpRequest(endpointUrl, null, false)
        .then(function(res) {
          updateCart(res.data);
          if (updateCheckout) {
            window._klarnaCheckout(function (api) {
              api.resume();
            });
          }
        }, function(reason) {
          var message = gettext('Error removing product from cart.');
          api.displayErrorToast(message, reason);
        });
    }

    function isCartProductAGiftcard(product) { //only valid for cart products
      return product['type_id'] && product['type_id'] === 'aw_giftcard2';
    }

    function cartHasGiftcard() {
      if (!cart.cartId || cart.products.length === 0) {
        return false;
      }

      for (var i = 0; i < cart.products.length; i++) {
        if (isCartProductAGiftcard(cart.products[i])) {
          return true;
        }
      }

      return false;
    }

    function isAllProductsInStock() {
      return lodash.find(cart.products, function(product) {
        return product['quantity_in_stock'] < product.quantity; }) ? false : true;
    }

    ////////////

    function updateCart(data) {
      /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
      /* jshint -W106 */
      //Bug RIDEAPI-85

      //check for diff before updating
      var productsOld = angular.toJson(data.products);
      var productsNew = angular.toJson(cart.products);

      if (cart.totalSum !== data.total_sum ||
        !lodash.isEqual(productsNew, productsOld) ||
        cart.cartId !== data.cartId) {

        cart.cartId = data.cartId;
        cart.products = data.products;
        cart.items = data.items;
        cart.totalSum = data.total_sum;
        /* jshint +W106 */
        /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */

        $rootScope.$broadcast('cart:cartUpdated', {cart: cart});
        storageService.set('cart', cart.cartId);
      }
    }
  }
})();
