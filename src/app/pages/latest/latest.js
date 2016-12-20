(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('latestController', latestController);

  latestController.$inject = ['api', 'gettext', '$q'];

  function latestController(api, gettext, $q) {
    /* jshint -W040 */
    var vm = this;
    /* jshint +W040 */

    var endpointUrl = 'feeds/latest';

    api.performJsonpRequest(endpointUrl)
      .then(function(res) {
        vm.data = res.data.data;
      }, function(reason) {
        var message = gettext('Error loading the data.');
        api.displayErrorToast(message, reason);
        return $q.reject(reason);
      });

  }

})();
