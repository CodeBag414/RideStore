(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('WorkController', WorkController);

  WorkController.$inject = ['$stateParams', '$state', 'contentful', 'head', 'locale'];

  function WorkController($stateParams, $state, contentful, head, locale) {
    var vm = this;
    vm.head = head;
    vm.department = $stateParams.department;

    getWorkEntry(vm.department);

    function getWorkEntry(department) {
      contentful
      .entries('content_type=work&fields.department=' + department + '&locale=' + locale.getLocale().replace('_','-'))
      .then(
        // Success handler
        function(response) {
          var entries = response.data;
          if (entries.items.length > 0) {
            vm.content = entries.items[0].fields;
          } else {
            $state.go('404');
          }
        },
        // Error handler
        function(response) {
          console.log('Oops, error ' + response.status);
        }
      );
    }
  }

})();
