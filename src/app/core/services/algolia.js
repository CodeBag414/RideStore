/**
 * algolia API endpoint service
 *
 *
 */
(function() {
  'use strict';

  angular
    .module('RidestoreApp')
    .factory('algolia', algolia);

  algolia.$inject = ['$http', 'locale'];

  function algolia($http, locale) {

    var APPLICATION_ID = 'RQ1FOH2C4F';
    var SEARCH_ONLY_API_KEY = '0d25e78e0acf09ee712eb5c482cf56d5';
    var INDEX_NAME = locale.getStore().algoliaIndex;
    var HITS_PER_PAGE = 24;

    var QUERY_TYPE = 'prefixLast'; //default behaviour
    var TYPO_TOLERANCE = 'true'; //default behaviour
    // TODO: add more search customization parameters

    var service = {
      simpleSearch: simpleSearch,
      searchWithParams: searchWithParams
    };
    return service;

    ////////////

    /**
     * @ngdoc method
     * @name simpleSearch
     * @methodOf RidestoreApp.algolia
     * @description Query the algolia index
     *
     * @param {string} query The instant-search query string, all words of the
     *  query are interpreted as prefixes (for example “John Mc” will match
     *  “John Mccamey” and “Johnathan Mccamey”). If no query parameter is set,
     *  retrieves all objects.
     * @returns {Promise} a promise for the HTTP response data of the given URL.
     */
    function simpleSearch(query) {
      var request = {
        method: 'GET',
        url: 'https://' + APPLICATION_ID + '-dsn.algolia.net/1/indexes/' + INDEX_NAME,
        params: {
          'query': query,
          'queryType': QUERY_TYPE,
          'typoTolerance': TYPO_TOLERANCE,
          // TODO: add more search customization parameters
          'hitsPerPage': HITS_PER_PAGE,
        },
        headers: {
          'X-Algolia-API-Key': SEARCH_ONLY_API_KEY,
          'X-Algolia-Application-Id': APPLICATION_ID
        }
      };

      return $http(request);
    }

    /**
     * @ngdoc method
     * @name searchWithParams
     * @methodOf RidestoreApp.algolia
     * @description Query the algolia index with parameters
     *
     * @param {object} params Object containing the parameters for the query
     *  examples:
     *  * query The instant-search query string, all words of the
     *  query are interpreted as prefixes (for example “John Mc” will match
     *  “John Mccamey” and “Johnathan Mccamey”). If no query parameter is set,
     *  retrieves all objects.
     *  * page Pagination parameter used to select the page to retrieve.
     *  Page is zero-based and defaults to 0. Thus, to retrieve the 10th page you need to set page=9
     *  * see https://www.algolia.com/doc/rest#query-an-index for the list of parameters
     * @returns {Promise} a promise for the HTTP response data of the given URL.
     */
    function searchWithParams(params) {
      var request = {
        method: 'GET',
        url: 'https://' + APPLICATION_ID + '-dsn.algolia.net/1/indexes/' + INDEX_NAME,
        params: params,
        headers: {
          'X-Algolia-API-Key': SEARCH_ONLY_API_KEY,
          'X-Algolia-Application-Id': APPLICATION_ID
        }
      };

      return $http(request);
    }

  }

})();
