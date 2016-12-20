/**
* Category
*
* Ridestore AB
*/
(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('CategoryController', CategoryController);

  CategoryController.$inject = [
    '$location', '$filter', '$rootScope', '$sce', '$scope', '$state',
    '$stateParams', '$timeout', '$window', 'toastr',
    'blazyService', 'categoryFactory', 'footerFactory', 'gettext',
    'gridService', 'head', 'lodash', 'productFilters', 'rsConfig', 'segment',
    'topFactory', 'tracking', 'adminAuthenticationService', 'categoryFewerProductsExperiment'
  ];

  /* jshint -W071 */ //too many statements
  /* jshint -W072 */ //too many parameters
  function CategoryController(
    $location, $filter, $rootScope, $sce, $scope, $state,
    $stateParams, $timeout, $window, toastr,
    blazyService, categoryFactory, footerFactory, gettext,
    gridService, head, lodash, productFilters, rsConfig, segment,
    topFactory, tracking, adminAuthenticationService, categoryFewerProductsExperiment) {

    var vm = this;
    var filters = {};
    var filterAPIString = '';
    var filterURLString = '';
    var filterFromParams;
    var otherParams;

    var scrollTimer;

    vm.head = head;

    /* jshint -W030 */
    vm.filterProducttype;
    /* jshint +W030 */

    vm.setFilter = setFilter;
    vm.mediaPath = rsConfig.mediaPath;

    vm.displayMaxBrands = displayMaxBrands;
    vm.displayMinBrands = displayMinBrands;
    vm.filterSearchBrand = filterSearchBrand;
    vm.filterBrandsVisible = rsConfig.filterParams.brands.minAmountVisible;
    vm.showAllBrands = false;

    vm.gridService = gridService;
    vm.toggledGridSize = toggledGridSize;

    vm.sortOrders = populateSortOrders();
    vm.sortOrderActive = {};
    vm.showSortOrderDropdown = false;
    vm.sortOrderChanged = false;
    vm.setSortOrder = setSortOrder;
    vm.toggleFilter = toggleFilterPanel;
    vm.getSeoUrlForFilter = getSeoUrlForFilter;
    vm.isAdminLoaded = adminAuthenticationService.isAdminLoaded;
    vm.categoryId = $stateParams.id;
    vm.go = $state.go;

    // only activate upon receiving the filters
    categoryFactory.getCategoryData($stateParams.id)
    .then(function(data) {
      //make our filter service aware of the available filters
      productFilters.setAvailableFilters(data.filters);

      activate();
    });
    guessIfBrandPage();
    setupFilterPanel(); //we set the filterPanel status outside activate() to avoid flickering

    ////////////

    function activate () {
      displayMessageFromStateParams();

      vm.totalVisible = rsConfig.categoryItems;

      //get eventual filters from url
      var originalUrlParams = productFilters.splitFilterParams($location.search());
      filterFromParams = originalUrlParams.filterParams;
      otherParams = originalUrlParams.otherParams;

      var sortOrderMode = $location.search().sort;

      vm.offsetSeparator = '.';

      vm.page = getPageValue(); //only matters for crawlers
      vm.offset = getOffsetValueAndSetTotalVisible(); //only matters for humans
      vm.startIndex = 0;

      //if url has changed (i.e. we changed categories/brands), clear filterFromParams
      if ($stateParams.url && '/' + $stateParams.url !== $location.path()) {
        sortOrderMode = null;
        filterFromParams = '';
        otherParams = '';
        vm.isBrandPage = false;
        resetTotalVisible();
        resetOffset();
        resetPage();
      }

      //listen on updateCategory to update the category
      $rootScope.$on('updateCategory', function(event, data) {
        getData(filterAPIString, true, data.sortMode);
      });

      //set url manually without reloading state.
      setUrl(); //using $stateParams
      updateUrlParameters(filterFromParams, otherParams);

      if (vm.page >= 0) {
        //if we have set a page, we don't care about scroll events,
        //as we are doing this page by page
        vm.preventScrollBinding = true;

        vm.startIndex = vm.page * rsConfig.categoryItems;

        $location.skipReload().search('page', vm.page);
      }

      populateFilters();

      vm.sortOrder = lodash.find(vm.sortOrders, { mode: sortOrderMode });
      if (vm.sortOrder && vm.sortOrder.mode) {
        getData(filterAPIString, null, vm.sortOrder.mode);
      } else {
        getData(filterAPIString);
      }

      vm.itemsPerRow = gridService.getItemsPerRow();
      injectSEOPrevNext();

      if (!vm.preventScrollBinding) {
        bindUnbindToEvent($window, 'scroll', loadOnScroll);
        bindUnbindToEvent($window, 'scroll', updateOffset);
      }

      //on change update page
      $scope.$watch(function() {
        return vm.page;
      }, function() {
        if (vm.page) {
          $location.search('page', vm.page).replace();
          injectSEOPrevNext();
        }
      });

      $rootScope.$on('$stateChangeStart',
        function(event, toState, toParams, fromState, fromParams, options) {
          //we need to unbind our scroll events even before the $destroy of our controller,
          //otherwise the url params are still being set
          if (fromState.name === 'category' && fromState.name !== toState.name) {
            angular.element($window).unbind('scroll', loadOnScroll);
            angular.element($window).unbind('scroll', updateOffset);
          }
        }
      );
      vm.adminConfig = configAdmin();
    }

    function configAdmin() {
      if (adminAuthenticationService.isAdmin()) {
        vm.sortOrders.push({name: gettext('Most sold'), mode: 'sold', id: 4, active: false});
      }

      return {
        isChangeOrderMode: false,
        isSetColorMode: ($stateParams.id === 'getAllProductsWithoutColor')
      };
    }

    ////////////

    function getData(filterString, fromFilter, sortOrderMode) {
      //Injecting Google Analytics Content Experiment
      if (categoryFewerProductsExperiment && categoryFewerProductsExperiment.variation === 1) {
        filterString = 'showbest=true&' + filterString;
      }

      return categoryFactory.getCategoryData($stateParams.id, filterString, sortOrderMode)
      .then(
        /* jshint -W074 */ //cyclomatic complexity is high
        function(data) {
        vm.data = data;

        //make our filter service aware of the available filters
        productFilters.setAvailableFilters(vm.data.filters);

        //if our index is bigger than our products, then go 404
        if (vm.startIndex && vm.startIndex > vm.data.products.length) {
          $state.go('404');
        }

        // if we have set an offset, we are now ready to scroll to it
        if (vm.offset) {
          $timeout(function() { $window.scrollTo(0, vm.offset); });
        }

        //check for producttype filter
        vm.filterProducttype = lodash.find(data.filters, function(obj) {
          return obj['filter_code'] === 'producttype';
        });

        //check for department filter (we clone this as we always want to show all values)
        if (!fromFilter) {
          var filterDepartment = lodash.find(data.filters, function(obj) {
            return obj['filter_code'] === 'department';
          });
          vm.filterDepartment = lodash.clone(filterDepartment);
        }

        //set the sort order the category is using, if not changed by the user
        if (!sortOrderMode) {
          setSortOrder(data['category_info']['sort_order']);
        }

        //set head meta tags
        head.setTitle(data['category_info']['meta_title']);
        head.setDescription(data['category_info']['meta_description']);
        head.setAppRoute('category', $stateParams.id);

        setUrl(data['category_info'].url);

        if (!fromFilter) {
          if (data['category_info']['is_brand_page'] === '1') {
            vm.isBrandPage = true;
            //change header
            topFactory.setState({design: 'transparent-white'});
            //close filter
            vm.filterActive = false;
            //set footer text
            if (data['category_info'].description) {
              footerFactory.setSeoText(data['category_info'].description, data['category_info'].name);
            }

            //set SEO specific filter if existent
            setSEOSpecificFilter();

          }
          else {
            vm.isBrandPage = false;
            //set footer text
            if (data['category_info']['cat_seo']) {
              footerFactory.setSeoText(data['category_info']['cat_seo'], data['category_info'].name);
            }
          }

          //segment tracking
          trackView();
          tracking.page(data['category_info']['meta_title']);
        }

        //reinit blazy to make it work with the sliding containers
        $timeout(function() {
          blazyService.createBlazy();
        });
      });
    }

    //////////// Filters

    /**
     * @ngdoc function
     * @name populateFilters
     * @description
     * set filters if there are any to be set.
     *
     */
    function populateFilters() {
      if (!lodash.isEmpty(filterFromParams)) {
        filters = productFilters.filterStringToArray(filterFromParams);
        var filterString = productFilters.filterArrayToString(filters);
        filterURLString = filterString.toUrl;
        filterAPIString = filterString.toAPI;
      }
    }

    function setFilter(filter, value, isToggle, reset) {
      resetTotalVisible();
      if (reset) {
        filters = {};
      }
      if (value.selected === false) {
        //add the filter to the array
        if (!filters[filter['filter_id']] || isToggle) {
          filters[filter['filter_id']] = [];
        }
        filters[filter['filter_id']].push(value['value_id']);
      } else {
        //remove the filter from the array
        filters[filter['filter_id']] = lodash.without(filters[filter['filter_id']] , value['value_id']);
        if (filters[filter['filter_id']].length < 1) {
          delete filters[filter['filter_id']];
        }
      }
      //if department filter we need to set selected manually as we have cloned it
      if (filter['filter_id'] === rsConfig.filters.filterMap.department['filter_id']) {
        toggleDepartmentValue(value);
      }

      //get new data with the filter
      var filterString = productFilters.filterArrayToString(filters);
      filterURLString = filterString.toUrl;
      filterAPIString = filterString.toAPI;

      getData(filterAPIString, true, vm.sortOrderActive.mode).then(function () {
        head.scrollToTop();
      });

      //update the url location parameters
      otherParams = productFilters.splitFilterParams($location.search()).otherParams;
      updateUrlParameters(filterURLString, otherParams);

      //segment tracking
      trackFilter(filter['filter_code'], value['value_name']);
    }

    function toggleDepartmentValue(value) {
      vm.filterDepartment.values = lodash.map(vm.filterDepartment.values,
        function(departmentValue) {
          if (departmentValue['value_id'] === value['value_id']) {
            departmentValue.selected = !departmentValue.selected;
          }
          else {
            departmentValue.selected = false;
          }
          return departmentValue;
        });
    }

    /**
     * @ngdoc function
     * @name setSEOSpecificFilter
     * @description
     * searches for a SEO specific filter.
     * if existent, then applies it
     * example http://www.ridestore.se/dope/-hood
     *
     */
    function setSEOSpecificFilter() {
      if (!isSEOSpecificFilter()) {
        return;
      }

      var filter = $stateParams.filter;
      var filterValue = {
        'value_id': filter['value_id'],
        'selected': false
      };
      setFilter(filter, filterValue);
      vm.isSEOSpecificFilter = true;
    }

    function isSEOSpecificFilter() {
      var filter = $stateParams.filter;
      if (filter && filter['filter_code'] && filter['filter_id'] && filter['value_id']) {
        return true;
      }
      return false;
    }

    //////////// Brands Search

    function displayMaxBrands() {
      vm.filterBrandsVisible = 100;
      vm.showAllBrands = true;
    }

    function displayMinBrands() {
      vm.filterBrandsVisible = rsConfig.filterParams.categories.minAmountVisible;
      vm.showAllBrands = false;
    }

    function filterSearchBrand() {
      if (vm.search['value_name'].length > 0) {
        displayMaxBrands();
      } else {
        displayMinBrands();
      }
    }

    //////////// Tracking

    function trackView() {
      segment.track(segment.events.PRODUCT_LIST_VIEWED, {
        'category': vm.data['category_info'].name,
        'list_id': vm.data['category_info'].name
      });
    }

    function trackFilter(filter, value) {
      segment.track(segment.events.PRODUCT_LIST_FILTERED, {
        'category': vm.data['category_info'].name,
        'list_id': vm.data['category_info'].name,
        'filters': [{type: filter, value: value}]
      });
    }

    //////////// Filter Panel Display

    function setupFilterPanel() {
      if (head.getDevice() === 'desktop' && !head.isTablet() && !vm.isBrandPage) {
        vm.filterActive = true;
      } else {
        vm.filterActive = false;
      }
    }

    function toggleFilterPanel() {
      vm.filterActive = !vm.filterActive;
      if (head.getDevice() === 'mobile') {
        topFactory.setPopupStatus(vm.filterActive);
      }
      blazyService.removeFixedSize();
    }

    //////////// Sorting

    function populateSortOrders() {
      return [
        {name: gettext('Hot products'), mode: '', id: 1, active: false},
        {name: gettext('Cheapest first'), mode: 'price',  id: 3, active: false},
        {name: gettext('Latest first'), mode: 'launchdate',  id: 2, active: false},
      ];
    }

    function setSortOrder(sortOrderMode, update) {
      var foundSortOrder = lodash.find(vm.sortOrders, { mode: sortOrderMode });
      if (typeof foundSortOrder === 'undefined') {
        foundSortOrder = lodash.find(vm.sortOrders, { id: 1 });
      }
      lodash.map(vm.sortOrders,function(sortOrder) {
        sortOrder.active = false;
      });
      foundSortOrder.active = true;
      vm.sortOrderActive = foundSortOrder;
      vm.showSortOrderDropdown = false;
      if (update) {
        vm.sortOrderChanged = true;
        getData(filterAPIString, true, vm.sortOrderActive.mode);
      }
      if (vm.sortOrderChanged) { //only add the sortorder on the location parameters if it has changed
        $location.search('sort', foundSortOrder.mode);
      }
    }

    //////////// Infinite Scroll

    function loadOnScroll() {
      var windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;

      var scrollcontainer = document.getElementById('scrollcontainer');

      if (scrollcontainer !== null) {
        var docHeight = scrollcontainer.offsetHeight;
        var windowBottom = windowHeight + window.pageYOffset;

        if (windowBottom >= (docHeight - 200) &&
          vm.totalVisible && vm.data && vm.data.products &&
          vm.totalVisible < vm.data.products.length) {
          vm.totalVisible += 50;
          $scope.$apply();
        }
      }
    }

    //////////// Pagination

    function getPageValue() {
      if ($location.search().page) {
        return parseInt($location.search().page, 10);
      }

      return; //if none, return undefined
    }

    function resetPage() {
      if (vm.page >= 0) {
        $location.skipReload().search('page', null);
        vm.page = null;
      }
    }

    //////////// Offset

    /**
     * @ngdoc function
     * @name updateOffset
     * @description
     * updates the offset value after we stopped scrolling
     */
    function updateOffset() {
      if (scrollTimer) {
        $timeout.cancel(scrollTimer);
      }
      scrollTimer = $timeout(function() {
        if ('/' + $stateParams.url === $location.path() && $window.scrollY !== 0) {
          $location.search('offset', $window.scrollY + vm.offsetSeparator + vm.totalVisible).replace();
        } else {
          $location.search('offset', null).replace();
        }

        return null;
      }, 150);
    }

    function resetOffset() {
      $location.skipReload().search('offset', null);
      vm.offset = null;
    }

    function getOffsetValueAndSetTotalVisible() {
      if ($location.search().offset) {
        var offsetParam = $location.search().offset;

        //offset should be a two part composite value `scrollY`.`totalVisible`
        if (offsetParam.indexOf(vm.offsetSeparator) !== -1) {
          //extract the totalVisible amount
          offsetParam = offsetParam.split(vm.offsetSeparator);
          vm.totalVisible = parseInt(offsetParam[1], 10);

          var offset = parseInt(offsetParam[0], 10);

          return offset;
        }
      }

      return; //if none, start undefined
    }

    //////////// SEO

    function injectSEOPrevNext() {
      var currentPage = vm.page > 0 ? vm.page : 0;
      var nextPage = currentPage + 1;
      var prevPage = currentPage > 0 ? currentPage - 1 : null;

      vm.canonicalHref = prepareUrlForSEO($location.url(), currentPage);

      vm.prevHref = prevPage !== null && prevPage >= 0 ?
        vm.canonicalHref.replace('page=' + currentPage, 'page=' + prevPage) : null;

      vm.nextHref = nextPage !== null && nextPage >= 0 ?
        vm.canonicalHref.replace('page=' + currentPage, 'page=' + nextPage) : null;

      if (currentPage === 0) {
        vm.canonicalHref = vm.canonicalHref.replace('page=0', '');
        vm.canonicalHref = cleanUpUrl(vm.canonicalHref);
      }

      head.injectSEOPrevNext(vm.canonicalHref, vm.prevHref, vm.nextHref);
    }

    function prepareUrlForSEO(url, page) {
      var cleanUrl = url;

      //if no parameters in url then append '?'
      if (url.indexOf('?') === -1) {
        cleanUrl = cleanUrl + '?';
      }

      //remove offset parameter and its value
      cleanUrl = cleanUrl.replace(/\&?(offset\=\d*\.?\d*)/, '');

      //append page number if not existent
      if (cleanUrl.indexOf('page=') === -1) {
        cleanUrl = cleanUrl + '&page=' + page;
      }

      cleanUrl = cleanUpUrl(cleanUrl);

      return cleanUrl;
    }

    function cleanUpUrl(url) {
      //remove eventual leading ampersand:
      //e.g. http://host?&parameter=value -> http://host?parameter=value
      url = url.replace(/(\?\&)/, '?');

      //remove eventual trailing question mark:
      //e.g. http://host? -> http://host
      if (lodash.endsWith(url, '?')) {
        url = url.replace('?', '');
      }
      return url;
    }

    ////////////

    /**
    * @ngdoc function
    * @name bindUnbindToEvent
    * @description
    * binds a function to an event on an element,
    * and unbinds it on controller $destroy
    */
    function bindUnbindToEvent(el, ev, fn) {
      angular.element(el).bind(ev, fn);

      //unbind event on destroy
      $scope.$on('$destroy', function() {
        angular.element(el).unbind(ev, fn);
      });
    }

    function toggledGridSize() {
      vm.itemsPerRow = gridService.getItemsPerRow();
    }

    function resetTotalVisible() {
      vm.totalVisible = rsConfig.categoryItems;

      resetOffset();
      updateOffset();
    }

    /**
     * @ngdoc function
     * @name setUrl
     * @description set the url manually from a given url in case
     *    the url is not set yet, or from $stateParams
     *
     * @param {String} [url=undefined] if url is passed, then attempts to set the url
     *
     */
    function setUrl(url) {
      if (url) {
        if ($location.url() === '/') { //if it has not already been set
          $location.url('/' + url);
        }
      } else {
        if ($stateParams.url) {
          $location.url($stateParams.url);
        }
      }
    }

    /**
     * @ngdoc function
     * @name guessIfBrandPage
     * @description
     * a hack to guess if this is a brand page.
     * to set the design before we get the data to minimise flickering.
     */
    function guessIfBrandPage() {
      var path = $location.path();
      if (typeof $stateParams.url !== 'undefined') {
        path = $stateParams.url;
      }

      //if our path starts with a leading '/', remove it
      if (path.substring(0, 1) === '/') {
        path = path.substring(1);
      }

      if (path.length > 1 && path.split('/').length < 2) {
        vm.isBrandPage = true;
        //change header
        topFactory.setState({design: 'transparent-white'});
        //close filter
        vm.filterActive = false;
      } else {
        vm.isBrandPage = false;
        //change header
        topFactory.setState({design: 'default'});

        setupFilterPanel();
      }
    }

    function updateUrlParameters(filterParamsString, otherParamsString) {
      // if its the SEO specific filter, we don't update the location url
      if (isSEOSpecificFilter()) {
        return;
      }

      var urlParams = [];
      if (filterParamsString.length > 0) {
        urlParams.push(filterParamsString);
      }
      if (otherParamsString.length > 0) {
        urlParams.push(otherParamsString);
      }
      var urlParamsString = urlParams.join('&');
      $location.skipReload().search(urlParamsString);
    }

    function getSeoUrlForFilter(filtername) {
      return vm.data['category_info'].url + '/-' + $filter('urlify')(filtername);
    }

    function displayMessageFromStateParams() {
      if (!$stateParams.message) {
        return;
      }
      var messageObject = $stateParams.message;
      var type = $stateParams.message.type ? $stateParams.message.type : 'info';
      var title = $stateParams.message.title ? $stateParams.message.title : null;
      var body = $stateParams.message.body ? $stateParams.message.body : null;

      if (body) {
        toastr[type](body, title);
      }
    }

  }

})();
