/**
* Ridestore API endpoint service
* see http://www.ridestore.se/test2/api-docs/
*
* Ridestore AB
*/
(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('wishAndCartMigrationService', wishAndCartMigrationService);

  wishAndCartMigrationService.$inject = ['$cookies', '$window', '$location',
  'cart', 'head', 'favorites', 'lodash', '$http'];

  function wishAndCartMigrationService($cookies, $window, $location,
    cart, head, favorites, lodash, $http) {

    var WISHLIST_COOKIE_KEY = 'wishlist_cookie';

    var SESSION_TO_CART_ENDPOINT = '/rsrest/index/getoldcart';
    var CART_ID_VARIABLE_NAME = 'cartId';

    var COOKIE_EXPIRE_IN_N_DAYS = 365;
    var COOKIE_HAS_BEEN_MIGRATED = 'rs.migrated';

    var ENABLED_IN_DOMAINS = ['com', 'fi', 'de'];

    var cartId;
    var favoritesArray;

    activate();

    return {};

    ////////////

    function activate() {
      if (lodash.indexOf(ENABLED_IN_DOMAINS, head.getTopLevelDomain()) < 0) {
        return; // not active in the current domain
      }

      if (!$cookies.get(COOKIE_HAS_BEEN_MIGRATED)) {
        parseFavorites();
        parseCart();

        $cookies.put(COOKIE_HAS_BEEN_MIGRATED, 1, {expires: getCookieExpirationDate()});
      }
    }

    ////////////

    function parseCart() {
      //we first verify the user has no items in current cart
      cart.refreshCart().then(function (res) {
        if (res.items === 0) {
          setCartId();
        }
        //if the user already had a cart with items, we do nothing.
      });

    }

    function parseFavorites() {
      var wishlistCookie = $cookies.get(WISHLIST_COOKIE_KEY);

      if (wishlistCookie) {
        var wishlist = angular.fromJson(wishlistCookie);
        favoritesArray = parseCookieToFavorites(wishlist);

        favorites.bulkAddToFavorites(favoritesArray);
      }

    }

    ////////////

    function setCartId() {
      var params = {};
      var url = SESSION_TO_CART_ENDPOINT + '?callback=JSON_CALLBACK';

      return $http({
        method: 'JSONP',
        cache: false,
        url: url,
        params: params,
      }).then(function (res) {
        if (res.data[CART_ID_VARIABLE_NAME] && res.data.found) {
          cartId = res.data[CART_ID_VARIABLE_NAME];

          return cart.reInitCart(cartId);
        }
      });
    }

    function parseCookieToFavorites(wishlist) {
      var cookieArray = wishlist.itemlist;
      var favoritesArray = [];

      for (var i = 0; i < cookieArray.length; i++) {
        favoritesArray.push(cookieArray[i]['wishlist_item_id']);
      }

      return favoritesArray;
    }

    //////////// Other helper methods

    function getCookieExpirationDate() {
      var d = new Date();
      d.setTime(d.getTime() + (COOKIE_EXPIRE_IN_N_DAYS * 24 * 60 * 60 * 1000));
      return d.toUTCString();
    }

  }
})();
