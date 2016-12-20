(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('menuFactory', menuFactory);

  menuFactory.$inject = ['api', 'gettext', '$q'];

  function menuFactory(api, gettext, $q) {

    return {
      getData: getData
    };

    function getData() {
      var endpointUrl = 'menus';
      return api.performJsonpRequest(endpointUrl, null, false)
        .then(function(res) {
          return res.data.data;
        }, function(reason) {
          var message = gettext('Error loading the menu.');
          api.displayErrorToast(message, reason);
          return $q.reject(reason);
        });
    }

  }

})();
