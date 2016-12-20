(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('startFactory', startFactory);

  startFactory.$inject = ['$http','rsConfig', 'contentful', 'locale'];

  function startFactory($http, rsConfig, contentful, locale) {

    return {
      getContentfulData: getContentfulData
    };

    function getContentfulData(url) {
      //change contentful space to start
      angular.extend(contentful.options, rsConfig.contentfulParamsStart);
      return contentful
      .entries(url + '&locale=' + locale.getLocale().replace('_','-'))
      .then(
        // Success handler
        function(response) {
          return response.data;
        },
        // Error handler
        function(response) {
          console.log('Oops, error ' + response.status);
        }
      ).finally(function() {
        //restore config override
        angular.extend(contentful.options, rsConfig.contentfulParamsMain);
      });
    }

  }

})();
