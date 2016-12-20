/* global _ */
(function () {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('topFactory', topFactory);

  topFactory.$inject = ['$rootScope', '$timeout', 'blazyService', 'head', 'segment', 'cart', 'lodash'];

  function topFactory($rootScope, $timeout, blazyService, head, segment, cart, lodash) {
    /* jshint -W106 */
    /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */

    var menuStatus = false;
    var cartStatus = false;
    var favoritesStatus = false;
    var searchStatus = false;
    var popupStatus = false;
    var searchSticky = false;
    var windowWidth;
    var activeDepartment = '';

    var topStatus = true;
    var defaultState =  {
      design: 'default',
      fixed: true,
      logo: true,
      backbutton: false,
      dropdown: false,
      minimal: false,
      scroll: true
    };

    var state = lodash.clone(defaultState);

    return {
      setState: setState,
      getState: getState,
      setTopStatus: setTopStatus,
      getTopStatus: getTopStatus,
      setMenuStatus: setMenuStatus,
      getMenuStatus: getMenuStatus,
      toggleCart: toggleCart,
      getCartStatus: getCartStatus,
      toggleFavorites: toggleFavorites,
      getFavoritesStatus: getFavoritesStatus,
      toggleSearch : toggleSearch,
      getSearchStatus : getSearchStatus,
      setSearchSticky: setSearchSticky,
      getPopupStatus : getPopupStatus,
      setPopupStatus : setPopupStatus,
      getWindowWidth : getWindowWidth,
      setActiveDepartment : setActiveDepartment,
      getActiveDepartment : getActiveDepartment
    };

    function setState(newState) {
      state = _.clone(defaultState);

      _.each(newState, function(value,key,obj) {
        state[key] = value;
      });
    }

    function getState() {
      return state;
    }

    function setTopStatus(status) {
      topStatus = status;
      return topStatus;
    }

    function getTopStatus() {
      return topStatus;
    }

    function getMenuStatus() {
      return menuStatus;
    }

    function setMenuStatus(newStatus) {
      menuStatus = newStatus;
      setPopupStatus(menuStatus);
      return menuStatus;
    }

    function getCartStatus() {
      return cartStatus;
    }

    function toggleCart() {
      cartStatus = !cartStatus;
      if (cartStatus && favoritesStatus) {
        favoritesStatus = false;
      }

      setPopupStatus(cartStatus);

      if (cartStatus) {
        $rootScope.$broadcast('cart:cartVisible');
        trackViewedCart();
      }
      return cartStatus;
    }

    function getFavoritesStatus() {
      return favoritesStatus;
    }

    function toggleFavorites() {
      favoritesStatus = !favoritesStatus;
      if (favoritesStatus && cartStatus) {
        cartStatus = false;
      }

      setPopupStatus(favoritesStatus);

      return favoritesStatus;
    }

    function toggleSearch() {
      if (!searchSticky) {
        searchStatus = !searchStatus;
      }
      return searchStatus;
    }

    function getSearchStatus() {
      return searchStatus;
    }

    function setSearchSticky(isSticky) {
      if (isSticky) {
        searchSticky = isSticky;
        searchStatus = isSticky;
      }
    }

    function isSearchSticky() {
      return isSearchSticky;
    }

    function getActiveDepartment() {
      return activeDepartment;
    }

    function setActiveDepartment(newDepartment) {
      activeDepartment = newDepartment;
      return activeDepartment;
    }

    function getPopupStatus() {
      return popupStatus;
    }

    function getWindowWidth() {
      return windowWidth;
    }

    function setPopupStatus(status) {
      popupStatus = status;
      windowWidth = _.clone(document.body.scrollWidth);
      //hide/show intercom button
      var intercomContainer = document.getElementById('intercom-container');
      if (intercomContainer !== null) {
        if (popupStatus) {
          intercomContainer.style.display = 'none';
        }
        else {
          intercomContainer.style.display = 'block';
        }
      }
      //if iOS prevent body scroll with js
      if (head.isIOS()) {
        if (popupStatus) {
          document.body.addEventListener('touchmove', preventScroll, false);
        } else {
          document.body.removeEventListener('touchmove', preventScroll, false);
        }
      }

      //reinit blazy after 500ms so animation can finish. (revalidate wont work when using scroll container)
      $timeout(function() {
        blazyService.createBlazy();
      },500);

      return popupStatus;
    }

    //helpers below

    function trackViewedCart() {
      var trackingCart = cart.getCart();
      var products = extractProductIds(trackingCart.products);

      segment.track(segment.events.CART_VIEWED, {
        cart_id: trackingCart.cartId,
        products: products
      });
    }

    function extractProductIds(products) {
      var productIds = [];
      products.forEach(function(product) {
        productIds.push({product_id: product.config_id});
      });
      return productIds;
    }

    function preventScroll(e) {
      //check if the user is scrolling on the popup bg
      if (e.target.className.indexOf('bg') > -1) {
        e.preventDefault();
      }
    }

  }
  /* jshint +W106 */
  /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */

})();
