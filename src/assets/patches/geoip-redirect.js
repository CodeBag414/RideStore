(function() {
  'use strict';

  /* global geoip2 */

  activate();

  //////////////////

  function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + '; ' + expires;
  }

  function getCookie(cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return '';
  }

  function getTLD() {
    var tld = location.hostname.split('.');
    tld = tld[tld.length - 1].toLowerCase();
    return tld;
  }

  //source http://stackoverflow.com/a/11582513/1740488
  function getURLParameter(name) {
    /* jshint -W101 */
    return decodeURIComponent(
      (new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) ||
      [null, ''])[1].replace(/\+/g, '%20')
    ) || null;
  }

  //redirects to tld address if not already there
  function redirectToTLD(tld) {
    if (getTLD() !== tld) {
      window.location = '//www.ridestore.' + tld + window.location.pathname + window.location.search;
    }
  }

  //redirects to country store if possible, else redirects to .com
  function redirectToStore(country) {
    var tld = getTLD();
    if (country === 'se' || country === 'no' || country === 'fi' || country === 'de') {
      redirectToTLD(country);
    } else {
      redirectToTLD('com');
    }
  }

  function onSuccess(geoip) {
    var country = geoip.country['iso_code'].toLowerCase();
    setCookie('country-iso_code', country, 30); //setting it for the next 30d
    redirectToStore(country);
  }

  function onError(error) {
    console.error('geoip error', error);
  }

  function runGeoIP2(attempts) {
    attempts++;

    if (window.geoip2) {
      geoip2.country(onSuccess, onError);
    } else {
      if (attempts < 50) { //we try a maximum of 50 times (5s)
        setTimeout(function() { runGeoIP2(attempts); }, 100); //try again later
      }
    }
  }

  function activate() {
    //if url-param then write cookie
    var preferredStoreUrlParam = getURLParameter('ps');
    if (preferredStoreUrlParam) {
      setCookie('preferred-store', preferredStoreUrlParam, 365);
    }

    var preferredStore = getCookie('preferred-store');
    var countryCookie = getCookie('country-iso_code');

    if (preferredStore) { //always force the redirect to the preferred store.
      redirectToTLD(preferredStore);
    } else if (countryCookie) { //otherwise lets see if has been redirected recently.
      redirectToStore(countryCookie);
    } else { //alright..last choice, we use the geoip2 service.
      runGeoIP2(0);
    }
  }

}());
