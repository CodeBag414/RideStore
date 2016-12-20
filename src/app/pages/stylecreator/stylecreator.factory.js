(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('stylecreatorFactory', stylecreatorFactory);

  stylecreatorFactory.$inject = ['adminAuthenticationService', 'api', 'lodash',
    'gettext', 'favorites', 'rsConfig', '$location', '$q'];

  function stylecreatorFactory(adminAuthenticationService, api, lodash,
    gettext, favorites, rsConfig, $location, $q) {

    return {
      getProductsData: getProductsData,
      getSelectedProducts: getSelectedProducts,
      getSizes: getSizes,
      toggleArrayItem: toggleArrayItem,
      saveToFavorites: saveToFavorites,
      getImages: getImages,
      getUrl: getUrl,
    };

    function getProductsData(departmentId, filterArray, status, disableCache) {
      var endpointUrl = 'stylecreator/department/' + departmentId;

      var queryString = toQueryString(filterArray);
      if (status) {
        queryString += '&status=' + status;
      }

      var cache = true;
      if (disableCache) {
        cache = false;
      }

      return api.performJsonpRequest(endpointUrl, queryString, cache)
        .then(function(res) {
          return res.data;
        }, function(reason) {
          var message = gettext('Error loading products details.');
          api.displayErrorToast(message, reason);
          return $q.reject(reason);
        });
    }

    function getSelectedProducts(departmentId, productIds) {
      var endpointUrl = 'products/getListStylecreator/' + departmentId;
      var params = 'ids=[' + productIds + ']';
      return api.performJsonpRequest(endpointUrl, params)
        .then(function(res) {
          //temp fix to return correct data types
          res.data.data.products.forEach(function(product) {
            product.id = parseInt(product.id);
            product['category_id'] = parseInt(product['category_id']);
          });

          return res.data;
        }, function(reason) {
          var message = gettext('Error loading style details.');
          api.displayErrorToast(message, reason);
          return $q.reject(reason);
        });
    }

    function getSizes(productId) {
      var endpointUrl = 'products/' + productId + '/sizes';
      return api.performJsonpRequest(endpointUrl)
      .then(function(res) {
        return res.data;
      }, function(reason) {
        var message = gettext('Error loading sizes.');
        api.displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    function getImages(departmentId, products, cacheBreaker) {

      var baseURl = adminAuthenticationService.isAdmin() ?
        rsConfig.stylecreatorAdminApiBaseUrl : rsConfig.stylecreatorApiBaseUrl;
      var angles = ['front', 'back'];
      var images = {};

      //making sure we only get one request for the same products, regardless of build order
      products = products.sort();

      var selectedProducts = lodash.map(products,function(productId) {
        return {'product_id': productId};
      });
      var version = '&v=' + cacheBreaker;

      angles.forEach(function(angle) {
        images[angle] = baseURl + 'image?department=' + departmentId +
        '&angle=' + angle + '&products=' + JSON.stringify(selectedProducts) + version;
      });
      return images;
    }

    function getUrl(department, products) {
      if (products.length < 1) {
        return ''; //if no products, return empty string
      }

      var url = {
        baseURl: $location.protocol() + '://' + $location.host(),
        port: '' + $location.port(),
        path: '/stylecreator/',
        department: department.name,
        param: '?p=',
        products: products.join()
      };

      var urlString = url.baseURl;
      if (url.port.length > 0 &&
          url.port !== '80' && //ignore http
          url.port !== '443' //ignore https
        ) {
        urlString += ':' + url.port;
      }

      urlString += url.path + url.department + url.param + url.products;

      return urlString;
    }

    function saveToFavorites(selectedProducts, department) {
      var customStyleProduct = {
        department: department,
        products: selectedProducts,
      };
      return favorites.addCustomStyleToFavorites(customStyleProduct).then(
        function(res) {
          return res;
        }
      );
    }

    //helpers below
    function toggleArrayItem(a, v) {
      var i = a.indexOf(v);
      if (i === -1) {
        a.push(v);
      }
      else {
        a.splice(i,1);
      }
      return a;
    }

    function toQueryString(obj) {
      return lodash.map(obj, function(v,k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(v);
      }).join('&');
    }

  }

})();
