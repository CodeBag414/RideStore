(function() {
  'use strict';

  angular
    .module('RidestoreApp')
    .factory('instantCheckoutService', instantCheckoutService);

  instantCheckoutService.$inject = ['api', 'cart', 'gettext'];
  function instantCheckoutService(api, cart, gettext) {
    var service = {
      instantCheckout: instantCheckout,
    };

    return service;

    ////////////////

    function instantCheckout(productId, options) {
      return _addToTempCart(productId, options).then(function(res) {
        return {
          status: 'success',
          cartId: res.data.cartId,
          configId: productId,
          options: options,
          result: res
        };
      }, function(reason) {
        var message = gettext('Error adding product to cart.');
        api.displayErrorToast(message, reason);
        return {
          status: 'error',
          reason: reason
        };
      });
    }

    ////////////////

    function _addToTempCart(productId, options) {
      var endpointUrl = 'carts/add/product/' + productId;

      return api.performJsonpRequest(endpointUrl, {'options': options}, false);
    }
  }
})();
