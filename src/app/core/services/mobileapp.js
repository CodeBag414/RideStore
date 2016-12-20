/**
* Service to customize the views if requested from our native mobile apps.
*
*/
(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('mobileAppFactory', mobileAppFactory);

  mobileAppFactory.$inject = ['topFactory', 'footerFactory', '$cookies'];

  function mobileAppFactory(topFactory, footerFactory, $cookies) {
    var status = false;

    return {
      setStatus: setStatus,
      getStatus: getStatus,
      openAppLink: openAppLink,
      checkIsApp: checkIsApp,
      callUrlWithIframe: callUrlWithIframe
    };

    function setStatus(newStatus) {
      status = newStatus;
      topFactory.setTopStatus(!status);
      footerFactory.setVisibility(false);
      return status;
    }

    function getStatus() {
      return status;
    }

    function checkIsApp() {
      if (window.location.hash.indexOf('isapp') > -1 || window.location.search.indexOf('isapp') > -1 ||
        window.location.search.indexOf('appnew') > -1 || $cookies.get('isapp')) {
        setStatus(true);
        $cookies.put('isapp', 1, {expires: getCookieExpirationDate()});
      }
    }

    function openAppLink(state, id) {
      var protocol = 'app-link://';
      //map new state names to old, todo change in app to new state names
      switch (state) {
        case 'product-configurable':
          state = 'product';
          break;
        case 'product-style':
          state = 'style';
          break;
        case 'category':
          state = 'products/1';
          break;
      }
      var action = state;
      console.log(id);
      if (typeof id !== 'undefined' && id !== '0') {
        action += '/' + id;
      }
      window.location.href = protocol + action;
    }

    /**
     * @ngdoc function
     * @name callUrlWithIframe
     * @description
     * method to call app url with iframe instead of location, for some reason this is needed in the checkout.
     */
    function callUrlWithIframe(url) {
      var iframe = document.createElement('IFRAME');
      iframe.setAttribute('src', url);
      document.documentElement.appendChild(iframe);
      iframe.parentNode.removeChild(iframe);
      iframe = null;
    }

    //////////// Other helper methods

    function getCookieExpirationDate() {
      var COOKIE_EXPIRE_IN_N_DAYS = 30;
      var d = new Date();
      d.setTime(d.getTime() + (COOKIE_EXPIRE_IN_N_DAYS * 24 * 60 * 60 * 1000));
      return d.toUTCString();
    }

  }
})();
