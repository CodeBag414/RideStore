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
  .factory('api', api);

  api.$inject = ['$locale', '$http', '$q', 'adminAuthenticationService', 'gettext',
    'locale', 'rsConfig', 'toastr', 'gettextCatalog'];

  function api($locale, $http, $q, adminAuthenticationService, gettext,
    locale, rsConfig, toastr, gettextCatalog) {

    var categoryImageSize = {}; //TODO: extract this to a better location

    return {
      // Products
      getProducts: getProducts,
      outofstockNotice: outofstockNotice,
      getSkuByEan: getSkuByEan,

      // Categories - see src/app/pages/category
      setCategorySortOrder: setCategorySortOrder,
      saveSortOrder: saveSortOrder,

      // Brands - see src/app/pages/brands

      // Cart - see src/app/components/cart

      // Checkout - see src/app/pages/checkout

      // Reviews
      getReviews: getReviews,
      reviewAdd: reviewAdd,

      // Stickers
      postStickersOrder: postStickersOrder,
      checkStickersPayment: checkStickersPayment,

      // Customer
      allOrders: allOrders,
      checkPin: checkPin,
      sendPin: sendPin,
      sendEmail:sendEmail,
      subscribeEmailList: subscribeEmailList,

      // Style Creator - see src/app/pages/stylecreator
      setProductStylecreatorStatus: setProductStylecreatorStatus,
      incrementStylecreatorCaching: incrementStylecreatorCaching,
      addStyle: addStyle,

      // Helpers
      performJsonpRequest: performJsonpRequest,

      getRewrite: getRewrite,

      displayErrorToast: displayErrorToast,

      getCategoryImageSize: getCategoryImageSize,
      setCategoryImageSize: setCategoryImageSize,
      guessColor:guessColor,
      setColor:setColor,

      // CRUD Editor
      crudGetTables: crudGetTables,
      crudRead: crudRead,
      crudCreate: crudCreate,
      crudDelete: crudDelete,
      crudUpdate: crudUpdate,

    };

    ////////////

    // Porcelain methods for accessing the API
    // TODO: each should be moved into the corresponding service

    // Products

    /**
     * @ngdoc function
     * @name getProducts
     * @description
     *
     * @param {string | Array} productIds
     *
     * @return {promise}
     */
    function getProducts(productIds) {
      if (productIds instanceof Array === false) {
        productIds = [].concat(productIds); //convert 2 array
      }

      var endpointUrl = 'products/';
      var params = {
        ids: JSON.stringify(productIds),
      };

      return performJsonpRequest(endpointUrl, params)
      .then(function(result) {
        return result;
      }, function(reason) {
        var message = gettext('Error loading products.');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    function outofstockNotice(configId, simpleId, email) {
      var endpointUrl = 'products/' + configId + '/' + simpleId + '/addStockNotification';
      return performJsonpRequest(endpointUrl, {email:email})
      .then(function(res) {
        return res.data;
      }, function(reason) {
        var message = gettext('Error signing up for notifications.');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    function getSkuByEan(ean) {
      var endpointUrl = 'products/getByEan/' + ean;
      return performJsonpRequest(endpointUrl)
        .then(function(res) {
          if (res.error) {
            var message = gettext('Error retrieving SKU.');
            return $q.reject(res.status);
          }
          return res.data;
        }, function(reason) {
          var message = gettext('Error retrieving SKU.');
          displayErrorToast(message, reason);
          return $q.reject(reason);
        });
    }

    // Categories
    function setCategorySortOrder(category, sortOrder) {
      var endpointUrl = 'categories/' + category + '/setSortOrder/' + sortOrder;
      var params = {Authorization: adminAuthenticationService.getAdminToken() };

      return performJsonpRequest(endpointUrl, params, false)
      .then(function(res) {
        return res.data;
      }, function(reason) {
        var message = gettext('Error setting sort order.');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    function saveSortOrder(category, productIds) {
      var endpointUrl = 'categories/' + category + '/updateOrder';
      var params = {
        Authorization: adminAuthenticationService.getAdminToken(),
        'product_ids':JSON.stringify(productIds)
      };

      return performJsonpRequest(endpointUrl, params, false)
      .then(function(res) {
        return res.data;
      }, function(reason) {
        var message = gettext('Error setting sort order.');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    // Reviews
    function getReviews() {
      var endpointUrl = 'reviews';

      return performJsonpRequest(endpointUrl)
        .then(function(res) {
          return res.data;
        }, function(reason) {
          var message = gettext('Error fetching the reviews.');
          displayErrorToast(message, reason);
          return $q.reject(reason);
        });
    }

    function reviewAdd(myReview) {
      var endpointUrl = 'reviews/add';
      var params = myReview;

      return performJsonpRequest(endpointUrl, params)
        .then(function(res) {
          return res.data;
        }, function(reason) {
          var message = gettext('Error creating the review.');
          displayErrorToast(message, reason);
          return $q.reject(reason);
        });
    }

    // Stickers

    function postStickersOrder(order) {
      var endpointUrl = 'stickers/order';
      var params = order;

      return performJsonpRequest(endpointUrl, params)
      .then(function(result) {
        return result;
      }, function(reason) {
        var message = gettext('Error placing the stickers order.');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    function checkStickersPayment(orderId) {
      var endpointUrl = 'stickers/' + orderId + '/payment-done';

      return performJsonpRequest(endpointUrl)
      .then(function(result) {
        return result;
      }, function(reason) {
        var message = gettext('Error verifying the payment.');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    // Customers

    function checkPin(pin, phonenumber, usedFor) {
      var endpointUrl = 'customers/pin/check';
      var params = {
        phonenumber: phonenumber,
        pin: pin,
        'used_for': usedFor
      };

      return performJsonpRequest(endpointUrl, params, false)
        .then(function(res) {
          return res.data;
        }, function(reason) {
          var message = gettext('Error validating your pin.');
          displayErrorToast(message, reason);
          return $q.reject(reason);
        });
    }

    function sendPin(phonenumber, usedFor) {
      var endpointUrl = 'customers/pin/send';
      var params = {
        phonenumber: phonenumber,
        'used_for': usedFor
      };

      return performJsonpRequest(endpointUrl, params, false)
        .then(function(res) {
          return res.data;
        }, function(reason) {
          var message = gettext('An error occured when checking your phone.');
          displayErrorToast(message, reason);
          return $q.reject(reason);
        });
    }

    function allOrders(params) {
      var endpointUrl = 'customers/orders';

      return performJsonpRequest(endpointUrl, params)
      .then(function(res) {
        return res.data;
      }, function(reason) {
        var message = gettext('Error fetching your orders.');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    function subscribeEmailList(params) {
      var endpointUrl = 'customers/newsletter/subscribe';

      return performJsonpRequest(endpointUrl, params)
      .then(function(res) {
        return res.data;
      }, function(reason) {
        var message = gettext('Error subscribing to the mailing list.');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    function sendEmail(params) {
      var endpointUrl = 'email';

      return performJsonpRequest(endpointUrl, params)
      .then(function(res) {
        return res.data;
      }, function(reason) {
        var message = gettext('Error sending the email.');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    // Stylecreator

    function setProductStylecreatorStatus(productId, status, departmentId) {
      var endpointUrl = 'products/' + productId + '/' + departmentId + '/setStatus/' + status;
      var params = {Authorization: adminAuthenticationService.getAdminToken()};

      return performJsonpRequest(endpointUrl, params, false)
      .then(function(res) {
        return res.data;
      }, function(reason) {
        var message = gettext('Error setting Product status.');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    function incrementStylecreatorCaching(productId,departmentId) {
      var endpointUrl = 'products/' + productId + '/' + departmentId + '/incrementCaching';
      var params = {Authorization: adminAuthenticationService.getAdminToken()};

      return performJsonpRequest(endpointUrl, params, false)
      .then(function(res) {
        return res.data;
      }, function(reason) {
        var message = gettext('Error incrementing the product cache.');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    function addStyle(images, productIds, brandId, department) {
      var endpointUrl = 'styles/add';
      var params = {
        images: images,
        'product_ids': JSON.stringify(productIds),
        'brand_id': brandId,
        department: department,
        Authorization: adminAuthenticationService.getAdminToken()
      };

      return performJsonpRequest(endpointUrl, params, false)
      .then(function(res) {
        return res.data;
      }, function(reason) {
        var message = gettext('Error adding the style.');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    function guessColor(productId) {
      var endpointUrl = 'products/' + productId + '/guessColor';
      var params = {Authorization: adminAuthenticationService.getAdminToken()};

      return performJsonpRequest(endpointUrl,params)
      .then(function(res) {
        return res.data;
      }, function(reason) {
        var message = gettext('Error guessing color.');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    function setColor(productId, colorId) {
      var endpointUrl = 'products/' + productId + '/setColor/' + colorId;
      var params = {Authorization: adminAuthenticationService.getAdminToken()};

      return performJsonpRequest(endpointUrl,params)
      .then(function(res) {
        return res.data;
      }, function(reason) {
        var message = gettext('Error setting color.');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    // CRUD Editor
    function crudGetTables() {
      var endpointUrl = 'tables/list';
      var params = {Authorization: adminAuthenticationService.getAdminToken()};

      return performJsonpRequest(endpointUrl,params,false)
      .then(function(res) {
        return res.data;
      }, function(reason) {
        var message = gettextCatalog.getString('Error getting tables for crud');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    function crudRead(table) {
      var endpointUrl = 'tables/' + table + '/read';
      var params = {Authorization: adminAuthenticationService.getAdminToken()};

      return performJsonpRequest(endpointUrl,params,false)
      .then(function(res) {
        return res.data;
      }, function(reason) {
        var message = gettextCatalog.getString('Error getting table for crud');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    function crudCreate(table) {
      var endpointUrl = 'tables/' + table + '/create';
      var params = {Authorization: adminAuthenticationService.getAdminToken()};

      return performJsonpRequest(endpointUrl,params,false)
      .then(function(res) {
        return res.data;
      }, function(reason) {
        var message = gettextCatalog.getString('Error creating row in table');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    function crudDelete(table,id) {
      var endpointUrl = 'tables/' + table + '/delete/' + id;
      var params = {Authorization: adminAuthenticationService.getAdminToken()};

      return performJsonpRequest(endpointUrl,params,false)
      .then(function(res) {
        return res.data;
      }, function(reason) {
        var message = gettextCatalog.getString('Error deleting row');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    function crudUpdate(table,row) {
      var endpointUrl = 'tables/' + table + '/update';
      var params = {
        Authorization: adminAuthenticationService.getAdminToken(),
        row:row,
      };
      return performJsonpRequest(endpointUrl,params,false)
      .then(function(res) {
        return res.data;
      }, function(reason) {
        var message = gettextCatalog.getString('Error updating row');
        displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    //////////// Helpers for API requests

    /**
     * @ngdoc function
     * @name performJsonpRequest
     * @description performs a JSONP request to the API defined in rsConfig.apiBaseUrl
     *
     * @param {String} endpointUrl the API endpoint to perform the request
     * @example reviews/add
     *
     * @param {Object | String} [params={}] contains the parameters necessary for the request
     *        if a string is passed, it is assumed that the content has both the key and the value
     *        for the query.
     * @example {data: 'that', is: 'needed', for: 'the', request: 'to', work: true}
     * @example 'data=that&is=needed&for=the&request=to&work=true'
     *
     * @param {boolean} [cache=true] if we want to cache the request. By default it is set to true.
     *
     * @return {Promise}
     */
    function performJsonpRequest(endpointUrl, params, cache) {
      if (typeof params === 'string') {
        return performJsonpRequestWithString(endpointUrl, params, cache);
      } else if (typeof params !== 'object' || params === null) {
        params = {};
      }

      if (cache == null) {
        cache = true;
      }

      params.callback = 'JSON_CALLBACK';
      params.lang = locale.getStore().id;

      var url = rsConfig.apiBaseUrl + endpointUrl;
      return $http({
        method: 'JSONP',
        cache: cache,
        url: url,
        params: params,
      });
    }

    /**
     * @ngdoc function
     * @name performJsonpRequestWithString
     * @description fallback from performJsonpRequest, for the api calls that already have
     *  the parameters parsed into a single string.
     *  performs a JSONP request to the API defined in rsConfig.apiBaseUrl
     *
     * @param {String} endpointUrl the API endpoint to perform the request
     * @example reviews/add
     *
     * @param {String} paramsString contains the string form of the parameters necessary for the request
     * @example 'data=that&is=needed&for=the&request=to&work=true'
     *
     * @param {boolean} [cache=true] if we want to cache the request. By default it is set to true.
     *
     * @return {Promise}
     */
    function performJsonpRequestWithString(endpointUrl, paramsString, cache) {
      if (cache == null) {
        cache = true;
      }

      var callbackStr = 'callback=JSON_CALLBACK';
      var langStr = 'lang=' + locale.getStore().id;

      paramsString = paramsString + '&' + callbackStr + '&' + langStr;

      var url = rsConfig.apiBaseUrl + endpointUrl + '?' + paramsString;

      return $http({
        method: 'JSONP',
        cache: cache,
        url: url
      });
    }

    function getRewrite(url) {
      var endpointUrl = 'rewrite';
      var params = {url: url};

      return performJsonpRequest(endpointUrl, params)
      .then(function(res) {return res.data; });
    }

    function displayErrorToast(message, reason) {
      if (typeof reason !== 'undefined' && typeof reason.status !== 'undefined') {
        var details;
        var errorType = Math.round(reason.status / 100); // expected to be either 3, 4 or 5
        switch (errorType) {
          case 4:
            details = gettext('Please verify your network connection, and try again');
            break;
          case 3:
          case 5:
            details = gettext('We have some monkeys working as fast as possible to fix this, please try again later');
            break;
          default:
            details = gettext('Something is wrong, nobody knows what is up.');
        }
        console.log('displayErrorToast', errorType, reason, message, details);
        toastr.error(details, message);
      } else {
        toastr.error(message);
      }
    }

    // Other helpers TODO: no business in api.js should be moved

    function getCategoryImageSize() {
      return categoryImageSize;
    }

    function setCategoryImageSize(width, dpr) {
      categoryImageSize = {'width': width, 'dpr': dpr};
    }
  }
})();
