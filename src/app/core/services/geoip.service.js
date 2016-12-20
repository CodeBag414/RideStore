/**
* geoip service
*
* Ridestore AB
*/

(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('geoipService', geoipService);

  geoipService.$inject = ['$cookies', '$window', 'head'];

  function geoipService($cookies, $window, head) {
    var COOKIES_EXPIRE_IN_N_DAYS = 30;

    var country = $cookies.get('country-iso_code');
    var performedRequest = false;

    activate();

    return {
      getCountry: getCountry
    };

    ////////////

    function activate() {
      if (!$window.geoip2 && head.getTopLevelDomain === 'com') {
        console.warn('no geoip2 loaded'); //warn that we are in .com and no geoip2 was loaded
        return;
      }
    }

    ////////////

    function getCountry() {
      if (country) {
        return country;
      } else if ($window.geoip2 && !performedRequest) {
        performedRequest = true; //we only want to perform request once
        $window.geoip2.country(onGeoIPSuccess, onGeoIPError);
      }
    }

    ////////////

    function onGeoIPSuccess(geoip) {
      country = geoip.country['iso_code'].toLowerCase();
      var expires = setCookieExpirationDate();
      $cookies.put('country-iso_code', country, {expires: expires});
    }

    function onGeoIPError(error) {
      performedRequest = false; //we will try again
      console.error('geoip error', error);
    }

    //////////// Other helper methods

    function setCookieExpirationDate() {
      var d = new Date();
      d.setTime(d.getTime() + (COOKIES_EXPIRE_IN_N_DAYS * 24 * 60 * 60 * 1000));
      return d.toUTCString();
    }

  }

}());
