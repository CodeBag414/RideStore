/**
* Ridestore locale service
*
* Ridestore AB
*/
(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('locale', locale);

  locale.$inject = ['$location', 'gettextCatalog', 'head', 'localeConfig', 'lodash'];

  function locale($location, gettextCatalog, head, localeConfig, lodash) {
    var store;

    return {
      setLocale: setLocale,
      getLocale: getLocale,
      getStore: getStore,
    };

    ////////////

    /**
     * @ngdoc function
     * @name setLocale
     * @description defines the language to be used throughout the store
     *    and starts the translation
     */
    function setLocale() {
      var locale = getStore().locale;
      //gettextCatalog.debug = true; //turn on that it say what is translated
      gettextCatalog.setCurrentLanguage(locale);
      gettextCatalog.loadRemote('/translations/' + locale + '/translation.json');
    }

    /**
     * @ngdoc function
     * @name getLocale
     * @description returns the locale to be used
     *
     * @return {string} the locale for the store as defined in localeConfig.stores
     * @example 'en_US'
     */
    function getLocale() {
      return getStore().locale;
    }

    /**
     * @ngdoc function
     * @name getStore
     * @description
     *  returns the correct store (singleton) object as defined in localeConfig.stores
     *  if the top level domain is not found as an id, it defaults to the store that has
     *  the attribute default set to true
     *
     * @return {Object} the store object as defined in localeConfig.stores
     */
    function getStore() {
      if (typeof store !== 'undefined') {
        return store;
      }

      var tld = head.getTopLevelDomain();
      store = lodash.find(localeConfig.stores, {'id': tld});

      if (typeof store === 'undefined') {
        store = lodash.find(localeConfig.stores, {'default': true});
      }

      return store;
    }

  }

})();
