(function() {
  'use strict';

  /**
  * @desc brand filter to be used on the filters area
  * @example
  *   <rs-brand-filter brands-array="vm.brandArray"
  *                    brands-array-key-amount="amount"
  *                    brands-array-key-name="name"
  *                    callback="vm.brandFilterCallback"
  *                    show-search-box="true"></rs-brand-filter>
  *
  * @param {Array} brands-array
  *   the brands to be iterated
  *
  * @param {string} [brands-array-key-amount]
  *   key for the brand amount in brands-array
  *
  * @param {string} brands-array-key-name
  *   key for the brand name in brands-array
  *
  * @param {function} callback
  *   function called on change: callback(brand)
  *
  * @param {boolean} [show-search-box=false]
  */
  angular
  .module('RidestoreApp')
  .directive('rsBrandFilter', rsBrandFilter);

  function rsBrandFilter() {
    var directive = {
      templateUrl: 'app/components/filters/brand-filter/brand-filter.html',
      restrict: 'E',
      scope: {
        brandsArray: '<',
        brandsArrayKeyAmount: '@?',
        brandsArrayKeyName: '@',
        callback: '<',
        showSearchBox: '<?',
      },
      controller: 'BrandFilterController',
      controllerAs: 'vm',
      bindToController: true // because the scope is isolated
    };

    return directive;
  }

}());
