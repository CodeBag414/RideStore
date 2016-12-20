/**
* Ridestore API endpoint service
*
* Ridestore AB
*/
(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('head', head);

  head.$inject = ['$location', 'rsConfig', 'smoothScroll', '$state', '$timeout', '$window'];

  /* jshint -W071 */
  function head($location, rsConfig, smoothScroll, $state, $timeout, $window) {
    var appRoute = '';
    var description = 'Ridestore - Streetwear, Motocross & Snow';
    var device = 'mobile';
    var image = resetImage();
    var title = 'Ridestore';
    var baseUrl = $location.absUrl().replace($location.url(),'');
    var mainSchema = _setMainSchema();
    var productSchema = '';
    var ampUrl = '';

    return {
      setTitle: setTitle,
      getTitle: getTitle,
      setDescription: setDescription,
      getDescription: getDescription,
      setImage: setImage,
      resetImage: resetImage,
      getImage: getImage,
      setAppRoute: setAppRoute,
      getAppRoute: getAppRoute,

      //Structured data json-ld
      getMainSchema: getMainSchema,
      getProductSchema: getProductSchema,
      setProductSchema: setProductSchema,

      // Host
      getTopLevelDomain: getTopLevelDomain,
      getBaseUrl: getBaseUrl,

      // Device
      getDevice: getDevice,
      setDevice: setDevice,

      // User Agent
      isAndroid: isAndroid,
      isFirefox: isFirefox,
      isSafari: isSafari,
      isIOS: isIOS,
      isTablet: isTablet,
      isPrerender: isPrerender,

      // Scroll Helper
      scrollToById: scrollToById,
      scrollToTop: scrollToTop,

      // SEO metadata
      injectSEOPrevNext: injectSEOPrevNext,

      // AMP
      hasAMP: hasAMP,
      getAMPURL: getAMPUrl,
      setAMPUrl: setAMPUrl,
    };

    function setTitle(newTitle) {
      title = newTitle;
    }

    function getTitle() {
      return title;
    }

    function setDescription(newDescription) {
      description = newDescription;
    }

    function getDescription() {
      return description;
    }

    function setImage(newImage) {
      image = newImage;
    }

    function resetImage() {
      image = 'https://d10g92rh9h0kij.cloudfront.net/media/new/ridestorelogo.png';
      return image;
    }

    function getImage() {
      return image;
    }

    function setAppRoute(path, id) {
      appRoute = path + '/' + id;
    }

    function getAppRoute() {
      return appRoute;
    }

    function _setMainSchema() {
      mainSchema = {
        '@context': 'http://schema.org',
        '@type': 'WebSite',
        'name': 'Ridestore',
        'url': baseUrl,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': baseUrl + '/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
        'aggregateRating': {
          '@type': 'AggregateRating',
          'bestRating': 10,
          'ratingValue': 9.8,
          'ratingCount': 1692,
        },
      };
    }

    function getMainSchema() {
      return mainSchema;
    }

    function getProductSchema() {
      return productSchema;
    }

    function setProductSchema(schema) {
      productSchema = schema;
    }

    ////////////////

    /**
     * @ngdoc function
     * @name getTopLevelDomain
     * @description returns the top level domain as present in the location bar
     * @requires $location
     * @return {string} the top level domain or if no . is present, the whole hostName
     */
    function getTopLevelDomain () {
      var host = $location.host();
      var separator = host.lastIndexOf('.');
      var tld = host.substring(separator + 1);

      return tld;
    }

    /**
     * @ngdoc function
     * @name getBaseUrl
     * @description returns the baseUrl of the app, including protocol, 'www.',
     * host, and port if not 80 or 443
     * @requires $location
     * @return {string} the whole base url
     */
    function getBaseUrl() {
      var baseUrl = $location.protocol() + '://' + $location.host();

      var port = '' + $location.port();

      if (port.length > 0 &&
          port !== '80' && //ignore http
          port !== '443' //ignore https
        ) {
        baseUrl += ':' + port;
      }

      return baseUrl;
    }

    ////////////////

    function getDevice() {
      return device;
    }

    function setDevice(width) {
      if (width >= 1024 && device === 'mobile') {
        device = 'desktop';
      }

      if (width < 1024 && device === 'desktop') {
        device = 'mobile';
      }

      return device;
    }

    ////////////////

    function isFirefox() {
      //regex extracted from https://github.com/ded/bowser/blob/master/src/bowser.js#L170
      var firefoxAgentRegex = /firefox|iceweasel|fxios/i;

      return userAgentTest(firefoxAgentRegex);
    }

    function isSafari() {
      var safariAgentRegex = /safari/i;

      return userAgentTest(safariAgentRegex);
    }

    function isAndroid() {
      var androidAgentRegex = /Android/i;

      return userAgentTest(androidAgentRegex);
    }

    function isTablet() {
      return (isAndroidTablet() || isIPad()) ? true : false;
    }

    function isAndroidTablet() {
      return (isAndroid() && !userAgentTest(/mobile/i)) ? true : false;
    }

    function isIPad() {
      var iPadAgentRegex = /ipad/i;

      return userAgentTest(iPadAgentRegex);
    }

    function isIOS() {
      var iOSAgentRegex = /iPad|iPhone/i;

      return userAgentTest(iOSAgentRegex);
    }

    function isPrerender() {
      if ($window.prerenderVar && $window.prerenderVar === 1) {
        return true;
      }
      return false;
    }

    function userAgentTest(regex) {
      return regex.test(navigator.userAgent);
    }

    ////////////////

    function scrollToById(targetId, offset, delay) {
      var element = document.getElementById(targetId);

      var options = {
        offset: offset,
      };
      $timeout(
        function() { smoothScroll(element, options); },
        delay
      );
    }

    function scrollToTop() {
      $timeout(function() { $window.scrollTo(0, 0); });
    }

    ////////////////

    function injectSEOPrevNext(canonicalUrl, prevUrl, nextUrl) {
      var base = $location.protocol() + '://' + $location.host();
      var head = angular.element(document.querySelector('head'));

      var canonicalSelector = 'head link[rel="canonical"]';
      if (canonicalUrl) {
        var seoCanonicalHref = base + canonicalUrl;
        var canonicalHtml = '<link rel="canonical" href="' + seoCanonicalHref + '">';
        appendOrReplaceElement(canonicalSelector, canonicalHtml, head);
      } else {
        removeElement(canonicalSelector);
      }

      var prevSelector = 'head link[rel="prev"]';
      if (prevUrl) {
        var seoPrevHref = base + prevUrl;
        var prevHtml = '<link rel="prev" href="' + seoPrevHref + '">';
        appendOrReplaceElement(prevSelector, prevHtml, head);
      } else {
        removeElement(prevSelector);
      }

      var nextSelector = 'head link[rel="next"]';
      if (nextUrl) {
        var seoNextHref = base + nextUrl;
        var nextHtml = '<link rel="next" href="' + seoNextHref + '">';
        appendOrReplaceElement(nextSelector, nextHtml, head);
      } else {
        removeElement(nextSelector);
      }
    }

    function appendOrReplaceElement(selector, html, parentElement) {
      removeElement(selector);
      parentElement.append(html);
    }

    function removeElement(selector) {
      if (angular.element(document.querySelector(selector)).length) {
        angular.element(document.querySelector(selector)).remove();
      }
    }

    //////////////// AMP
    function hasAMP() {
      if (getTopLevelDomain() !== 'se') {
        setAMPUrl('');
        return false;
      }

      if ($state.current.name !== 'product-configurable') {
        setAMPUrl('');
        return false;
      }

      return getAMPUrl().length > 0 ? true : false;
    }

    function getAMPUrl() {
      return ampUrl;
    }

    function setAMPUrl(url) {
      ampUrl = url;
    }

  }

})();
