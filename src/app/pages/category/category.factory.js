(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('categoryFactory', categoryFactory);

  categoryFactory.$inject = ['api', 'gettext', '$q','adminAuthenticationService'];

  function categoryFactory(api, gettext, $q,adminAuthenticationService) {

    return {
      getCategoryData: getCategoryData,
    };

    ////////////

    /**
     * @ngdoc function
     * @name getCategoryData
     * @description
     *
     * @param {string} id
     * @param {string} [filterQuery]
     * @param {string} [sortOrder]
     */
    function getCategoryData(id, filterQuery, sortOrder) {
      var endpointUrl = 'categories/' + id;
      var params = filterQuery ? filterQuery : '';

      //add sortorder as param
      if (typeof sortOrder !== 'undefined') {
        if (params) {
          params += '&';
        }
        params += 'sort=' + sortOrder;
      }
      if (adminAuthenticationService.isAdmin()) {
        if (params) {
          params += '&';
        }
        params += 'Authorization=' + adminAuthenticationService.getAdminToken();
      }

      return api.performJsonpRequest(endpointUrl, params)
        .then(function(res) {
          return res.data;
        }, function(reason) {
          var message = gettext('Error loading categories.');
          api.displayErrorToast(message, reason);
          return $q.reject(reason);
        });
    }

  }

})();
