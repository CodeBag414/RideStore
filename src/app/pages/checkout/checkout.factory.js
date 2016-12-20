/**
* Ridestore Checkout service
*
* Ridestore AB
*/
(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('checkout', checkout);

  checkout.$inject = ['api', 'geoipService', 'gettext', 'head', 'lodash',
    'rsConfig', '$q'];

  function checkout(api, geoipService, gettext, head, lodash,
    rsConfig,  $q) {

    var cartTotals;

    return {
      canShip: canShip,
      getCartTotals: getCartTotals,
      updateCartTotals: updateCartTotals,
      getSnippet: getSnippet,
      addDiscount: addDiscount,
      removeDiscount: removeDiscount,
      validateDiscount: validateDiscount,
      getActiveDiscounts: getActiveDiscounts,
      setShipping: setShipping,
    };

    ////////////

    function canShip() {
      if (head.getTopLevelDomain() !== 'com') { //only active on .com
        return true;
      }

      var country = geoipService.getCountry();

      if (!country) {
        return true; //shall we assume we can ship, even if we failed to get country?
      }

      if (lodash.indexOf(rsConfig.shipsTo, country) > -1) {
        return true;
      }
      return false;
    }

    function getCartTotals() {
      return cartTotals;
    }

    function updateCartTotals(cartId) {
      getSnippet(cartId);
    }

    /**
     * @ngdoc function
     * @name getSnippet
     * @description gets the checkout snippet from klarna
     *
     * @param {string} cartId

     * @param {string} successUrl
     * @example 'https://www.ridestore.se/checkout/success'

     * @param {string} failUrl
     * @example 'https://www.ridestore.se/checkout'
     *
     * @returns {Promise}
     */
    function getSnippet(cartId, successUrl, failUrl) {
      var endpointUrl = 'checkouts/' + cartId;
      var params = {
        'success_url': successUrl,
        'fail_url': failUrl,
      };
      var cacheRequest = false;

      return api.performJsonpRequest(endpointUrl, params, cacheRequest)
      .then(function(result) {
        if (result.data && result.data.cartTotals) {
          cartTotals = result.data.cartTotals;
        }
        return result;
      }, function(reason) {
        var message = gettext('Error loading the checkout page.');
        api.displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    /**
     * @ngdoc function
     * @name addDiscount
     * @description attempts to add a discount to the cart,
     *    If the return field 'pin_validation' is true, then the validateDiscount
     *    should be called providing the user inputted PIN.
     *
     * @param {string} cartId
     * @param {string} discountCode
     *
     * @returns {Promise}
     */
    function addDiscount(cartId, discountCode) {
      var endpointUrl = 'checkouts/' + cartId + '/discount/add/' + discountCode;
      var cacheRequest = false;

      return api.performJsonpRequest(endpointUrl, null, cacheRequest)
      .then(function(result) {
        return result;
      }, function(reason) {
        var message = gettext('Error adding the discount.');
        api.displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    /**
     * @ngdoc function
     * @name removeDiscount
     * @description attempts to remove a discount from the cart
     *
     * @param {string} cartId
     * @param {string} discountCode
     *
     * @returns {Promise}
     */
    function removeDiscount(cartId, discountCode) {
      var endpointUrl = 'checkouts/' + cartId + '/discount/remove/' + discountCode;
      var cacheRequest = false;

      return api.performJsonpRequest(endpointUrl, null, cacheRequest)
      .then(function(result) {
        return result;
      }, function(reason) {
        var message = gettext('Error removing the discount.');
        api.displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    /**
     * @ngdoc function
     * @name validateDiscount
     * @description attempts to validate a discount
     *
     * @param {string} cartId
     * @param {string} discountCode
     * @param {string} pin
     *
     * @returns {Promise}
     */
    function validateDiscount(cartId, discountCode, pin) {
      var endpointUrl = 'checkouts/' + cartId + '/discount/validate/' + discountCode + '/' + pin;
      var cacheRequest = false;

      return api.performJsonpRequest(endpointUrl, null, cacheRequest)
      .then(function(result) {
        return result;
      }, function(reason) {
        var message = gettext('Error validating the discount.');
        api.displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    /**
     * @ngdoc function
     * @name getActiveDiscounts
     * @description get the list of active discounts for the cartId
     *
     * @param {string} cartId
     *
     * @returns {Promise}
     */
    function getActiveDiscounts(cartId) {
      var endpointUrl = 'checkouts/' + cartId + '/discount/list';
      var cacheRequest = false;

      return api.performJsonpRequest(endpointUrl, null, cacheRequest)
      .then(function(result) {
        return result;
      }, function(reason) {
        var message = gettext('Error loading the active discounts.');
        api.displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    /**
     * @ngdoc function
     * @name setShipping
     * @description set the shipping method
     *
     * @param {string} cartId
     * @param {number} shippingId
     *  currently: 7 - dhl and 8 - ups
     * @returns {Promise}
     */
    function setShipping(cartId, shippingId) {
      var endpointUrl = 'checkouts/' + cartId + '/setShipping/' + shippingId;
      var cacheRequest = false;

      return api.performJsonpRequest(endpointUrl, null, cacheRequest)
      .then(function(result) {
        return result;
      }, function(reason) {
        var message = gettext('Error setting the shipping method.');
        api.displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    ////////////

  }
})();
