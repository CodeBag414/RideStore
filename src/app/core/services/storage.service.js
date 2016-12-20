(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('storageService', storageService);

  storageService.$inject = ['localStorageService', '$cookies'];

  function storageService(localStorageService, $cookies) {
    //var SESSION_STORAGE = 0; //unsupported, not needed for now
    var LOCAL_STORAGE = 1;
    var COOKIES = 2;

    var COOKIES_EXPIRE_IN_N_DAYS = 90;

    //PREFIX for cookies only, localStorageService has been using its default prefix (ls.)
    var PREFIX = 'rs.';

    /**
     * TODO: when rolling back to localstorage, we should change to
     * `initStorage(LOCAL_STORAGE);`
     *
     * Also, be aware of the need to have a prefix and perhaps add a prefix
     * other than the default to localStorageService.
    **/
    var storage = initStorage(COOKIES);

    activate();

    /**
     * @ngdoc service
     * @name RidestoreApp.storageService
     * @requires localStorageService
     * @requires $cookies
    **/
    return {
      get: get,
      remove: remove,
      set: set,
    };

    ////////////

    /**
     * @ngdoc method
     * @name initStorage
     * @methodOf RidestoreApp.storageService
     * @description initiates storage with the type defined, and will port all
     *  existing storage elements from the other type to the defined type;
     * @example initStorage(COOKIES) will port everything from localStorage to
     *  cookies and use cookies for all new values added.
     *
    **/
    function initStorage(type) {
      var storage = {
        type: type,
      };

      if (type === COOKIES) {
        storage.expires = setCookieExpirationDate();
      }

      return storage;
    }

    function activate() {
      portExistingStorageTo(storage.type);
    }

    //////////// Public methods ////////////

    /**
     * @ngdoc method
     * @name get
     * @methodOf RidestoreApp.storageService
     * @description
     * Returns the value of given storage key
     *
     * @param {string} key Id to use for lookup.
     * @returns {string} Raw storage value.
    **/
    function get(key) {
      var value;
      if (storage.type === COOKIES) {
        value = $cookies.getObject(PREFIX + key);
      } else if (storage.type === LOCAL_STORAGE) {
        value = localStorageService.get(key);
      }

      return value;
    }

    /**
     * @ngdoc method
     * @name remove
     * @methodOf RidestoreApp.storageService
     * @description
     * Remove given storage element
     *
     * @param {string} key Id of the key-value pair to delete.
    **/
    function remove(key) {
      if (storage.type === COOKIES) {
        $cookies.remove(PREFIX + key);
      } else if (storage.type === LOCAL_STORAGE) {
        localStorageService.remove(key);
      }
    }

    /**
     * @ngdoc method
     * @name set
     * @methodOf RidestoreApp.storageService
     * @description
     * Sets a value for given cookie key
     *
     * @param {string} key Id for the `value`.
     * @param {string} value Raw value to be stored.
    **/
    function set(key, value) {
      if (storage.type === COOKIES) {
        $cookies.putObject(PREFIX + key, value, {expires: storage.expires});
      } else if (storage.type === LOCAL_STORAGE) {
        localStorageService.set(key, value);
      }
    }

    //////////// Private methods ////////////

    //////////// Porting methods

    /**
     * @ngdoc method
     * @name portExistingStorageTo
     * @methodOf RidestoreApp.storageService
     * @description port all existing storage elements from the other type to
     * the defined type;
     * @example portExistingStorageTo(COOKIES) will port everything from
     * localStorage to cookies.
    **/
    function portExistingStorageTo(type) {
      if (type === COOKIES) {
        return portFromLocalStorageToCookies();
      } else if (type === LOCAL_STORAGE) {
        return portFromCookiesToLocalStorage();
      } else {
        console.error('RidestoreApp.storageService.portExistingStorageTo: unknown storage type', type);
      }
    }

    /**
     * @ngdoc method
     * @name portFromLocalStorageToCookies
     * @methodOf RidestoreApp.storageService
     * @description port all existing localStorage elements to cookies.
    **/
    function portFromLocalStorageToCookies() {
      //Read from localStorage
      var allLocalStorageKeys = localStorageService.keys(); //[] with all the keys

      for (var i = 0; i < allLocalStorageKeys.length; i++) {
        var key = allLocalStorageKeys[i];
        var value = localStorageService.get(key);

        // Write to cookies
        $cookies.putObject(PREFIX + key, value, {expires: storage.expires});

        //Cleanup localStorage
        localStorageService.remove(key);
      }
    }

    /**
     * @ngdoc method
     * @name portFromCookiesToLocalStorage
     * @methodOf RidestoreApp.storageService
     * @description port all existing cookies to localStorage.
     *
    **/
    function portFromCookiesToLocalStorage() {
      //Read from cookies
      var allCookies = $cookies.getAll(); //key-value object with all the cookies

      for (var prefixedKey in allCookies) {
        if (allCookies.hasOwnProperty(prefixedKey) && prefixedKey.indexOf(PREFIX) === 0) {
          var key = prefixedKey.split(PREFIX)[1]; //get the second part of the split
          var value = $cookies.getObject(prefixedKey);

          // Write to localStorage
          localStorageService.set(key, value);

          //leanup cookies
          $cookies.remove(prefixedKey);
        }
      }
    }

    //////////// Other helper methods

    function setCookieExpirationDate() {
      var d = new Date();
      d.setTime(d.getTime() + (COOKIES_EXPIRE_IN_N_DAYS * 24 * 60 * 60 * 1000));
      return d.toUTCString();
    }

  }
}());
