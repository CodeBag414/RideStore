/**
* Ridestore Categories productFilters service
*
* Ridestore AB
*/
(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('productFilters', productFilters);

  productFilters.$inject = ['$location', 'lodash', 'rsConfig'];

  function productFilters($location, lodash, rsConfig) {
    var filterUrlPrefix = rsConfig.filters.urlPrefix;
    var filterAPIformat = rsConfig.filters.apiFormat;
    var availableFilters = [];

    return {
      filterArrayToString: filterArrayToString,
      filterStringToArray: filterStringToArray,
      isValidFilter: isValidFilter,
      setAvailableFilters: setAvailableFilters,
      splitFilterParams: splitFilterParams,
    };

    ////////////

    function filterArrayToString(filterArray) {
      var ret = {
        toUrl: [],
        toAPI: [],
      };

      if (filterArray) {
        for (var filter in filterArray) {
          if (filterArray.hasOwnProperty(filter)) {
            ret.toUrl.push(getFilterStringForUrl(filter,filterArray[filter]));
            ret.toAPI.push(getFilterStringForAPI(filter,filterArray[filter]));
          }
        }

      }

      ret.toUrl = ret.toUrl.join('&');
      ret.toAPI = ret.toAPI.join('&');
      return ret;
    }

    function filterStringToArray(filterString) {
      var filters = {};
      filterString = filterString.split('&');
      for (var filter in filterString) {
        if (filterString.hasOwnProperty(filter)) {
          var parsedFilter = parseFilter(filterString[filter]);
          filters[parsedFilter.id] = parsedFilter.values;
        }
      }
      return filters;
    }

    /**
     * @ngdoc function
     * @name isValidFilter
     * @description
     *  validates a filter name based if its mapped in the rsConfig.filterMap,
     *  if it is part of the availableFilters, or on its prefix
     * @param {Object} filterProperties - {filterCode, filterId}
     */
    function isValidFilter(filterProperties) {

      // we try to see if we have the filter mapped first
      if (getMappedFilter(filterProperties)) {
        return true;
      }

      //we try to see if we have it in the availableFilters
      if (getAvailableFilter(filterProperties)) {
        return true;
      }

      // we assume that if it starts with the defined prefix, it is a valid filter
      if (lodash.startsWith(filterProperties.filterCode, filterUrlPrefix)) {
        return true;
      }

      return false;
    }

    /**
     * @ngdoc function
     * @name splitFilterParams
     * @description
     * splits the parameters into 2 arrays:
     * - filterParams - containing the string with filter parameters
     * - otherParams - containing the string with other parameters
     * @param {String} query
     * @return {Object}
     */
    function splitFilterParams(query) {
      if (query.length === 0) {
        return {
          filterParams: '',
          otherParams: '',
        };
      }

      var params = lodash.clone(query);
      var result = {
        filterParams: [],
        otherParams: [],
      };

      for (var param in params) {
        if (params.hasOwnProperty(param)) {
          if (isValidFilter({filterCode: param})) { //TODO: need to load first the availableFilters
            result.filterParams.push(param + '=' + params[param]);
          } else {
            result.otherParams.push(param + '=' + params[param]);
          }
        }
      }
      result.filterParams = result.filterParams.join('&');
      result.otherParams = result.otherParams.join('&');
      return result;
    }

    /**
     * @ngdoc function
     * @name setAvailableFilters
     * @description
     * sets the availableFilters array for future lookups
     * each filter comes in the format:
     * {
     *   filter_code : "department",
     *   filter_id : "129",
     *   filter_name : "Avdelning",
     *   values: [
     *     {
     *       position : "0",
     *       selected: false,
     *       value_id: "17",
     *       value_name: "Streetwear"
     *     }
     *   ]
     * }
     */
    function setAvailableFilters(filters) {
      availableFilters = filters;
    }

    //////////// Private methods

    function parseFilter(filterString) {
      var filterCode = filterString.split('=')[0];
      filterCode = filterCode.replace(filterUrlPrefix, ''); //remove prefix
      var filterId = getFilterId(filterCode);
      var values  = filterString.split('=')[1].split(','); //extract the filter values

      return { id: filterId, code: filterCode, values: values};
    }

    /**
     * @ngdoc function
     * @name getFilterStringForAPI
     * @description converts a filter to the API accepted format
     *
     * @param {string} filterId - id of the filter to set
     * @param {array | string} values - array of strings, or single string
     *
     * @return {string} - filterstring with the format for the API request:
     *    'filter[FILTER_ID]=value,value,value...'
     */
    function getFilterStringForAPI(filterId, values) {
      return getFilterAPIKey(filterId) + '=' + getValuesString(values);
    }

    /**
     * @ngdoc function
     * @name getFilterStringForUrl
     * @description converts a filter to the format to be displayed on the location bar
     *
     * @param {string} filterId - id of the filter to set
     * @param {array | string} values - array of strings, or single string
     * @return {string} - filterstring with the format for the location bar
     *  in the format of prefix + filterCode + = + values
     */
    function getFilterStringForUrl(filterId, values) {
      var urlString = '';

      //if the filter is not mapped, nor available, then append prefix
      if (!getMappedFilter({filterId: filterId}) && !getAvailableFilter({filterId: filterId})) {
        urlString += filterUrlPrefix;
      }

      urlString += getFilterCode(filterId) + '=' + getValuesString(values);

      return urlString;
    }

    /**
     * @ngdoc function
     * @name getFilterCode
     * @description
     * given a filterId, attempts to return a filterCode, otherwise returns the filterId
     *
     */
    function getFilterCode(filterId) {
      //first we try locally to find it in our mapped filters
      var mappedFilter = getMappedFilter({filterId: filterId});
      if (mappedFilter) {
        return mappedFilter['filter_code'];
      }

      if (availableFilters.length > 0) {
        var availableFilter = getAvailableFilter({filterId: filterId});
        if (availableFilter) {
          return availableFilter['filter_code'];
        }
      }

      //if we still could not find, we return the filterId as the name
      return filterId;
    }

    function getFilterId(filterCode) {
      //first we try locally to find it in our mapped filters
      var mappedFilter = getMappedFilter({filterCode: filterCode});
      if (mappedFilter) {
        return mappedFilter['filter_id'];
      }

      if (availableFilters.length > 0) {
        var availableFilter = getAvailableFilter({filterCode: filterCode});
        if (availableFilter) {
          return availableFilter['filter_id'];
        }
      }

      //if we still could not find, we return the filterCode as the name
      return filterCode;
    }

    function getMappedFilter(filterProperties) {
      for (var mappedFilter in rsConfig.filters.filterMap) {
        if (rsConfig.filters.filterMap.hasOwnProperty(mappedFilter)) {
          if (filterProperties.filterCode) {
            if (filterProperties.filterCode === rsConfig.filters.filterMap[mappedFilter]['filter_code']) {
              return rsConfig.filters.filterMap[mappedFilter];
            }

          } else if (filterProperties.filterId) {
            if (filterProperties.filterId === rsConfig.filters.filterMap[mappedFilter]['filter_id']) {
              return rsConfig.filters.filterMap[mappedFilter];
            }
          }
        }
      }

      return false;
    }

    function getAvailableFilter(filterProperties) {
      if (availableFilters.length > 0) {
        for (var availableFilter in availableFilters) {
          if (availableFilters.hasOwnProperty(availableFilter)) {
            if (filterProperties.filterCode) {
              if (filterProperties.filterCode === availableFilters[availableFilter]['filter_code']) {
                return availableFilters[availableFilter];
              }

            } else if (filterProperties.filterId) {
              if (filterProperties.filterId === availableFilters[availableFilter]['filter_id']) {
                return availableFilters[availableFilter];
              }
            }
          }
        }
      }

      return false;

    }

    /**
     * @ngdoc function
     * @name getFilterAPIKey
     * @description
     * given a filterId, returns the filter key with the api format
     * as per http://www.ridestore.se/test2/api-docs/#Get-category-data
     * e.g.: getFilterAPIKey(123) => 'filter[123]'
     */
    function getFilterAPIKey(filterId) {
      return filterAPIformat.replace('%FILTER_ID%', filterId);
    }

    /**
     * @ngdoc function
     * @name getValuesString
     * @description
     *
     * @param {array | string} values - array of strings, or single string
     * @return {string} - a comma separated list of no duplicate values
     */
    function getValuesString(values) {
      values = [].concat(values); //converting to array if string
      values = lodash.uniq(values); //eliminate duplicates, TODO: should prevent this upstream
      values = values.join(); //joining the values up

      return values;
    }

  }
})();
