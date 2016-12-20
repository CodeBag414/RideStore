(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('SearchController', SearchController);

  /* jshint -W071 */
  //Bug RIDANG1-140
  SearchController.$inject = ['algolia', 'gridService', 'head', 'lodash', 'rsConfig',
    '$rootScope', '$scope', '$state', '$stateParams', '$window', 'topFactory', 'gettext',
    'toastr', 'segment'];

  function SearchController(algolia, gridService, head, lodash, rsConfig,
    $rootScope, $scope, $state, $stateParams, $window, topFactory, gettext,
    toastr, segment) {
    /* jshint validthis: true */
    var vm = this;

    vm.search = search;
    vm.nextPage = nextPage;

    vm.head = head;

    vm.searchVal = '';
    vm.products = [];
    vm.page = 0;
    vm.busy = false; //are we waiting for a server response?
    vm.searchParams = {};

    // holds the query filter object that will be passed on to state params
    vm.queryFilter = {};

    /* hardcoding some values that are not present with the algolia index */
    /* jshint -W106 */
    /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
    /* we ignore these lower_case variables for now */
    vm.image_padding = 'regular';
    vm.type_id = 'configurable';

    vm.brandFilterCallback = brandFilterCallback;

    vm.NO_REPOPULATE_FILTERS = 0;

    //mapping the facet names
    vm.FACET_BRAND = 'brand';
    vm.FACET_PRODUCT_TYPE = 'productype';
    vm.FACET_SIZE = 'size_array';

    vm.filters = [];
    vm.filters.brand = [];
    vm.filters.productTypes = [];
    vm.filterActive = false;

    vm.totalVisible = rsConfig.categoryItems;

    //category filter config
    vm.filterItemsMinAmountVisible = rsConfig.filterParams.categories.minAmountVisible;
    vm.displayMinCategories = displayMinCategories;
    vm.displayMaxCategories = displayMaxCategories;

    vm.gridService = gridService;

    vm.searchWithFilter = searchWithFilter;

    activate();
    setupFilters();

    ////////////

    function activate() {

      vm.facetFilters = setFacetFiltersFromUrl();

      if ($stateParams.q && $stateParams.q.length > 0) {
        vm.searchVal = $stateParams.q;
        search();
        broadcastSearchInputValue();
      }

      //listen to broadcast event on search input
      $scope.$on('top:search-input-has-changed', function (event, args) {
        vm.searchVal = args.searchQuery;
        vm.search();
      });

    }

    function broadcastSearchInputValue() {
      $rootScope.$broadcast('search:search-input-value', {searchQuery: vm.searchVal});
    }

    function setupFilters() {
      //show filters if on desktop
      if (head.getDevice() === 'desktop' && !head.isTablet()) {
        vm.filterActive = true;
      } else {
        vm.filterActive = false;
      }
    }

    /**
     * @ngdoc function
     * @name populateFilter
     * @description populates the vm.filters with the requested algolia facet.
     *    For example, given 'brand', vm.filters[brand] will be populated with
     * the possible brands from the facets results. Each brand will have the following
     * structure:
     * {
     *   amount : {int} the amount of results with that filter
     *   selected: {boolean} is the filter selected or not? (used to notify the ui)
     *   filterType: {string} the name of the facet, e.g. "brand"
     *   name: {string} the title of the filter item, e.g. "Dope"
     * }
     *
     * @param {string} facetName The name of the filter as it is in the facets
     *
     */
    function populateFilter(facetName) {
      // if facets doesn't contain facetName filter, leave
      if (vm.data.facets[facetName] == null) {
        return;
      }

      vm.filters[facetName] = Object.keys(vm.data.facets[facetName]).map(function(key) {
        var selected = isFilterInUrl(facetName, key);

        return {
          filterType: facetName,
          selected: selected,
          name: key,
          amount: vm.data.facets[facetName][key]
        };
      });
    }

    /**
     * @ngdoc function
     * @name isFilterInUrl
     * @description
     *
     * @param {string} facetName The name of the filter as it is in the url
     * @param {string} value The value of the filter
     *
     * @returns {boolean} if the filter is present in the url
     */
    function isFilterInUrl(facetName, value) {

      if (typeof $stateParams[facetName] === 'string' ||
          $stateParams[facetName] instanceof String) {

        if ($stateParams[facetName] === value) {
          return true;
        }
      } else if ($stateParams[facetName] instanceof Array) {

        for (var i = 0; i < $stateParams[facetName].length; i++) {
          if ($stateParams[facetName][i] === value) {
            return true;
          }
        }
      }
      return false;
    }

    function brandFilterCallback(brand) {
      var facet = vm.filters[vm.FACET_BRAND];

      for (var item in facet) {
        if (facet.hasOwnProperty(item)) {
          if (facet[item].name === brand.name) {
            facet[item] = brand;
          }
        }
      }

      searchWithFilter();
    }

    function searchWithFilter() {
      //adds the facetFilters parameter to the search query
      vm.facetFilters = setFacetFilters();

      // updates the queryfilter with the query value
      vm.queryFilter.q = vm.searchVal;

      $state.transitionTo('search', vm.queryFilter, { notify: false });

      vm.search(vm.NO_REPOPULATE_FILTERS); //performs a new search

    }

    /**
     * @ngdoc function
     * @name setFacetFiltersFromUrl
     * @description processes each valid parameter from the url and
     *    returns an array with the applied filters for further search
     * @returns {Array} the facetFilters Array according to algolia's specifications,
     *  e.g.: [["brand:Nike","brand:Newsoul"],"color:blue"]
     */
    function setFacetFiltersFromUrl() {
      var facetFilters = [];

      for (var key in $stateParams) {
        if ($stateParams.hasOwnProperty(key) &&
            $stateParams[key] !== undefined &&
            key !== 'q') {
          var value = [].concat($stateParams[key]); //making sure its array

          var tmpArr = [];
          for (var i = 0; i < value.length; i++) {
            var tmpFilter = '' + key + ':' + value[i];
            tmpArr.push(tmpFilter);
          }
          if (tmpArr.length !== 0) {
            facetFilters.push(tmpArr);
          }

        }
      }
      return JSON.stringify(facetFilters);
    }

    /**
     * @ngdoc function
     * @name setFacetFilters
     * @description processes the vm.filters, populates the queryFilter,
     *    and returns an array with the applied filters for further search
     * @returns {Array} the facetFilters Array according to algolia's specifications,
     *  e.g.: [["brand:Nike","brand:Newsoul"],"color:blue"]
     */
    function setFacetFilters() {
      vm.queryFilter = {};
      var facetFilters = [];
      // iterate through possible facets
      for (var i in vm.filters) {
        if (vm.filters.hasOwnProperty(i)) {
          var facet = vm.filters[i]; // e.g. brand
          var tmpArr = [];
          var tmpQueryArr = [];
          var tmpQueryFilterType = '';

          for (var item in facet) {
            if (facet.hasOwnProperty(item)) {
              // e.g. nike
              if (facet[item].selected) {
                var tmpFilter = '' + facet[item].filterType + ':' + facet[item].name;
                tmpArr.push(tmpFilter);
                /* jshint -W073 */
                /* ignoring the excessive deepness of nesting (6), TODO refactor */
                if (tmpQueryFilterType.length === 0) { //naming the facet for url
                  tmpQueryFilterType = facet[item].filterType;
                }
                tmpQueryArr.push(facet[item].name);
              }
            }
          }
          if (tmpArr.length !== 0) {
            facetFilters.push(tmpArr);
            vm.queryFilter[tmpQueryFilterType] = tmpQueryArr;
          }
        }
      }
      return JSON.stringify(facetFilters);
    }

    ////////////////

    function search(args) {

      var searchParams = {
        query: vm.searchVal,
        hitsPerPage: 25,
        page: vm.page,
        facets: '*', //List of object attributes that we want to use for faceting
        facetFilters: vm.facetFilters,
      };

      if (queryIsSame(searchParams)) {return;} //we don't want to query multiple times the same thing

      vm.busy = true;

      vm.page = 0; //resets the page to the first

      vm.searchParams = searchParams; //update the globalsearch parameters

      algolia.searchWithParams(vm.searchParams).then(
        function (response) {
          //Success

          vm.data = response.data;
          if (args !== vm.NO_REPOPULATE_FILTERS) {
            populateFilter(vm.FACET_BRAND);
            populateFilter(vm.FACET_PRODUCT_TYPE);
            populateFilter(vm.FACET_SIZE);
          }
          vm.products = response.data.hits;
          vm.busy = false;

          // fallback in case the search results don't match the current query
          if (response.data.query !== vm.searchVal) {
            search();
          }
        },
        function (reason) {
          //Error
          console.error('Failed request', reason);
          var message = gettext('Oopsie doopsie! An error occurred while searching for:') +
            ' ' + vm.searchParams.query;
          toastr.error(message);
          vm.busy = false;
        }
      );

      //segment tracking
      segment.track(segment.events.PRODUCTS_SEARCHED, {
        query: vm.searchVal
      });
    }

    function nextPage() {

      if (vm.busy) {return;} //we don't want to query multiple times the same thing
      vm.busy = true;

      vm.page++;
      vm.searchParams.page = vm.page; //increment the page

      algolia.searchWithParams(vm.searchParams).then(
        function (response) {
          //Success
          vm.products = vm.products.concat(response.data.hits);
          vm.busy = false;
        },
        function (reason) {
          //Error
          console.error('Failed request', reason);
          vm.busy = false;
        }
      );
    }

    function queryIsSame(searchParams) {
      return lodash.isEqual(vm.searchParams, searchParams);
    }

    ////////////////

    function displayMaxCategories() {
      vm.showAllCategories  = true;
    }

    function displayMinCategories() {
      vm.showAllCategories  = false;
    }

    //load more products on scroll
    angular.element($window).bind('scroll', searchScroll);

    function searchScroll() {
      var windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
      var scrollcontainer = document.getElementById('search-scroll-container');
      var itemHeight = document.getElementsByClassName('object')[0].scrollHeight;
      var docHeight = scrollcontainer.offsetHeight;
      var windowBottom = windowHeight + window.pageYOffset;

      // start loading next before the last two lines are visible
      if (windowBottom >= (docHeight - 2 * itemHeight)) {
        vm.nextPage();
        $scope.$digest();
      }
    }

    //unbind scroll event on destroy
    $scope.$on('$destroy', function() {
      angular.element($window).unbind('scroll', searchScroll);
      //close search when you leave search
      topFactory.toggleSearch();
      //todo also clear the searchbox value
    });

    $rootScope.$on('$stateChangeStart',
      function(event, toState, toParams, fromState, fromParams, options) {
        //we need to unbind our scroll events even before the $destroy of our controller,
        if (fromState.name === 'search' && fromState.name !== toState.name) {
          angular.element($window).unbind('scroll', searchScroll);
        }
      }
    );
  }

})();
/* jshint +W071 */
