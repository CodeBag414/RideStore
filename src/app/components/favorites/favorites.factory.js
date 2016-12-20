/**
* Ridestore API endpoint service
*
* Ridestore AB
*/
(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('favorites', favorites);

  favorites.$inject = ['head', 'storageService', 'lodash', 'segment',
    '$location', '$q', '$rootScope', 'stylecreatorConfig'];

  function favorites(head, storageService, lodash, segment,
    $location, $q, $rootScope, stylecreatorConfig) {

    var favorites = initFavorites();

    activate();

    return {
      addToFavorites: addToFavorites,
      addCustomStyleToFavorites: addCustomStyleToFavorites,
      bulkAddToFavorites: bulkAddToFavorites,
      clearFavorites: clearFavorites,
      generateFavoritesUrl: generateFavoritesUrl,
      getFavorites : getFavorites,
      getCustomStyleFavorites: getCustomStyleFavorites,
      getFavoritesCount: getFavoritesCount,
      isFavorite: isFavorite,
      removeFromFavorites: removeFromFavorites,
      removeCustomStyleFromFavorites: removeCustomStyleFromFavorites,
    };

    ////////////

    function activate() {
      cleanUpCustomStyleFavorites(); //see method description
    }

    /**
     * @ngdoc method
     * @name cleanUpCustomStyleFavorites
     * @methodOf RidestoreApp.favorites
     * @description temporary method to clean up bug where unwanted properties were
     * added to customStyleProducts, which allowed for duplicates to be inserted.
     * This was causing the full break of the display of customStyleFavorites.
     */
    function cleanUpCustomStyleFavorites() {
      if (favorites.customStyleProducts.length === 0) {
        return;
      }

      rebuildCustomStyleProductsFromFavoritesUrls();

      //remove old/unwanted properties
      for (var i = 0; i < favorites.customStyleProducts.length; i++) {
        delete favorites.customStyleProducts[i].productsDetails;
        delete favorites.customStyleProducts[i].images;
        delete favorites.customStyleProducts[i].url;
      }

      convertAllCustomStyleProductsIdsToStrings();

      //update the data without dupes
      var data = lodash.cloneDeep(favorites);
      data.customStyleProducts = lodash.uniqWith(data.customStyleProducts, lodash.isEqual);
      updateFavorites(data);
    }

    function rebuildCustomStyleProductsFromFavoritesUrls() {
      var tmpArr = [];
      for (var i = 0; i < favorites.customStyleProducts.length; i++) {
        if (favorites.customStyleProducts[i].url) {
          var cSP = getCustomStyleProductFromCustomStyleUrl(favorites.customStyleProducts[i].url);
          tmpArr.push(cSP);
        }
      }
      favorites.customStyleProducts = favorites.customStyleProducts.concat(tmpArr);
    }

    //converts customStyleUrl into a product
    function getCustomStyleProductFromCustomStyleUrl(url) {
      url.substring(url.lastIndexOf('/'));

      var urlDeparment = url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('?'));
      var urlProducts = url.substring(url.lastIndexOf('?p=') + 3);

      var products = urlProducts.split(',');

      return {
        department: getDepartmentByName(urlDeparment),
        products: products
      };
    }

    function getDepartmentByName(name) {
      for (var department in stylecreatorConfig.departments) {
        if (stylecreatorConfig.departments.hasOwnProperty(department)) {
          if (department === name) {
            var dep = stylecreatorConfig.departments[department];
            return {
              id: dep[0].id,
              name: dep[0].name
            };
          }
        }
      }
    }

    function convertAllCustomStyleProductsIdsToStrings() {
      for (var i = 0; i < favorites.customStyleProducts.length; i++) {
        var cSP = favorites.customStyleProducts[i];
        for (var j = 0; j < cSP.products.length; j++) {
          cSP.products[j] = '' + cSP.products[j];
        }
      }
    }

    ////////////

    /**
     * @ngdoc function
     * @name addToFavorites
     * @description adds a product to favorites given its productId
     *      and registers it in storage
     *
     *      note: the productId comes from the API as number and from Algolia index as string
     *
     * @param {string | number} productId The id of the product, can be string or number
     */
    function addToFavorites(productId) {
      var data = lodash.cloneDeep(favorites);
      var productIdString = '' + productId;

      data.products.push(productIdString);

      // making sure we are not adding more than once
      data.products = lodash.uniqWith(data.products, lodash.isEqual);

      updateFavorites(data);

      /* jshint -W106 */
      /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
      segment.track(segment.events.PRODUCT_ADDED_TO_WISHLIST, {product_id: productId});
      /* jshint +W106 */
      /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
    }

    /**
     * @ngdoc function
     * @name addCustomStyleToFavorites
     * @description
     * adds a customStyleProduct to favorites
     *
     * @param {object} customStyleProduct
     *      object of the type:
     *      {
     *        department: {id, name},
     *        products: [productIds],
     *      }
     */
    function addCustomStyleToFavorites(customStyleProduct) {
      return $q(function(resolve, reject) {
        var data = lodash.cloneDeep(favorites);
        var cSP = lodash.cloneDeep(customStyleProduct);

        //we make sure all products ids are strings
        var products = cSP.products.map(function(product) {
          return '' + product;
        });

        // we only store these 2 properties
        var cleanedStyleProduct = {
          department: cSP.department,
          products: products,
        };

        data.customStyleProducts.push(cleanedStyleProduct);

        // making sure we are not adding more than once
        data.customStyleProducts = lodash.uniqWith(data.customStyleProducts, lodash.isEqual);

        updateFavorites(data);

        resolve(data); //resolve the promise
      });
    }

    /**
     * @ngdoc function
     * @name bulkAddToFavorites
     * @description adds a bunch of products to favorites given their productId
     *      and registers it in storage
     *
     * @param {Array} products Array of product ids, can be string or number
     */
    function bulkAddToFavorites(products) {
      if (Array.isArray(products)) {
        for (var i = 0; i < products.length; i++) {
          addToFavorites(products[i]);
        }
      }
    }

    /**
     * @ngdoc function
     * @name clearFavorites
     * @description clears the 'favorites' storage entry and initiates it again
     */
    function clearFavorites() {
      storageService.remove('favorites');
      favorites = initFavorites();
    }

    /**
     * @ngdoc function
     * @name generateFavoritesUrl
     * @description generates the url based on the current host
     * @return {string} the url string or an empty string in case of no favorites
     */
    function generateFavoritesUrl() {
      if (favorites.count < 1) {
        return ''; //if no favorites, return empty string
      }

      var url = {
        baseUrl: head.getBaseUrl(),
        path: '/favorites?',
        param: 'sf=',
        products: JSON.stringify(favorites.products)
      };

      return url.baseUrl + url.path + url.param + url.products;
    }

    /**
     * @ngdoc function
     * @name getFavorites
     * @description getter for the favorites array
     *
     * @returns {Array} The favorites array
     */
    function getFavorites() {
      return lodash.cloneDeep(favorites.products);
    }

    /**
     * @ngdoc function
     * @name getCustomStyleFavorites
     * @description getter for the custom style favorites array
     *
     * @returns {Array} The custom style favorites array
     */
    function getCustomStyleFavorites() {
      return lodash.cloneDeep(favorites.customStyleProducts);
    }

    /**
     * @ngdoc function
     * @name getFavoritesCount
     * @description getter for the amount of favorites
     *
     * @returns {number} The number of products in favorites
     */
    function getFavoritesCount() {
      return favorites.count;
    }

    /**
     * @ngdoc function
     * @name isFavorite
     * @description verifies if a product is a favorite
     *     note: the productId comes from the API as number and from Algolia index as string
     *
     * @param {string | number} productId The id of the product, can be string or number
     *
     * @returns {boolean} if the productId is part of the favorites.products array
     */
    function isFavorite(productId) {
      var productIdString = '' + productId;

      for (var i = 0; i < favorites.products.length; i++) {
        if (productIdString === favorites.products[i]) {
          return true;
        }
      }
      return false;
    }

    /**
     * @ngdoc function
     * @name removeFromFavorites
     * @description removes a product from favorites given its productId
     *      and registers it in storage
     *
     *     note: the productId comes from the API as number and from Algolia index as string
     *
     * @param {string | number} productId The id of the product, can be string or number
     */
    function removeFromFavorites(productId) {
      var data = lodash.cloneDeep(favorites);
      var productIdString = '' + productId;

      lodash.pull(data.products, productIdString);

      updateFavorites(data);
    }

    /**
     * @ngdoc function
     * @name removeCustomStyleFromFavorites
     * @description removes a custom Style product from favorites given its products Array
     *      and registers it in storage
     *
     * @param {Array} products - the productsids that make a style
     */
    function removeCustomStyleFromFavorites(products) {
      var data = lodash.cloneDeep(favorites);

      var customStyleProduct = lodash.find(data.customStyleProducts, {products: products});

      lodash.pull(data.customStyleProducts, customStyleProduct);

      updateFavorites(data);
    }

    ////////////

    /**
     * @ngdoc function
     * @name initFavorites
     * @description initiates the favorites object, either by getting the existing
     *      on in local storage, or by setting an empty one in memory.
     *
     * @returns {Object} The favorites object
     */
    function initFavorites() {
      var emptyFavorites = {
        'products': [],
        'customStyleProducts': [],
        'count': 0
      };

      var favorites = storageService.get('favorites');

      if (favorites) {
        if (favorites.customStyleProducts) {
          return favorites;
        } else { //backwards compatibility
          favorites.customStyleProducts = [];
          return favorites;
        }
      } else {
        return emptyFavorites;
      }
    }

    /**
     * @ngdoc function
     * @name updateFavorites
     * @description registers the data object as 'favorites' in storage
     *
     * @param {Object} data The object containing the data to add to the favorites
     *
     */
    function updateFavorites(data) {
      favorites.products = data.products;
      favorites.customStyleProducts = data.customStyleProducts;
      favorites.count = favorites.products.length + favorites.customStyleProducts.length;

      $rootScope.$broadcast('favorites:favoritesUpdated', {favorites: favorites});

      storageService.set('favorites', favorites);
    }

  }
})();
