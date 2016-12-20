(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('InfoController', InfoController);

  InfoController.$inject = ['topFactory', 'contentful', 'locale', '$stateParams'];

  function InfoController(topFactory, contentful, locale, $stateParams) {

    var vm = this;
    var callback = 'JSON_CALLBACK';
    topFactory.setState('default dropdown');

    getEntry();

    function getEntry() {
      contentful
      .entries('content_type=info&fields.name=' + $stateParams.name + '&locale=' + locale.getLocale().replace('_','-'))
      .then(
        // Success handler
        function(response) {
          var entries = response.data;
          if (entries.items.length > 0) {
            vm.content = entries.items[0].fields.content;
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
