(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('BrandFilterController', BrandFilterController);

  BrandFilterController.$inject = ['$scope', 'rsConfig'];

  function BrandFilterController($scope, rsConfig) {

    var vm = this;

    vm.filterSearchBrand = filterSearchBrand;
    vm.filterSearchBrandValue = '';

    vm.displayMinBrands = displayMinBrands;
    vm.displayMaxBrands = displayMaxBrands;

    activate();

    ////////////

    function activate() {
      vm.amountVisible = rsConfig.filterParams.brands.minAmountVisible;
      vm.brandsArray = $scope.vm.brandsArray;
      vm.brandsArrayKeyAmount = $scope.vm.brandsArrayKeyAmount;
      vm.brandsArrayKeyName = $scope.vm.brandsArrayKeyName;
      vm.callback = $scope.vm.callback;
      vm.showAllBrands = false;
      vm.showSearchBox = $scope.vm.showSearchBox;

      setWatchers();
    }

    /**
     * @ngdoc function
     * @name filterSearchBrand
     * @description if we are filtering a brand, we display as many
     *   brands as possible.
     */
    function filterSearchBrand() {
      if (vm.filterSearchBrandValue.length > 0) {
        displayMaxBrands();
      } else {
        displayMinBrands();
      }
    }

    function displayMaxBrands() {
      vm.showAllBrands  = true;
    }

    function displayMinBrands() {
      vm.showAllBrands  = false;
    }

    ////////////

    function setWatchers() {
      $scope.$watch('vm.brandsArray', function() {
        vm.brandsArray = $scope.vm.brandsArray;
      });

      $scope.$watch('vm.brandsArrayKeyAmount', function() {
        vm.brandsArrayKeyAmount = $scope.vm.brandsArrayKeyAmount;
      });

      $scope.$watch('vm.brandsArrayKeyName', function() {
        vm.brandsArrayKeyName = $scope.vm.brandsArrayKeyName;
      });

      $scope.$watch('vm.callback', function() {
        vm.callback = $scope.vm.callback;
      });

      $scope.$watch('vm.showSearchBox', function() {
        vm.showSearchBox = $scope.vm.showSearchBox;
      });
    }

  }

  angular
  .module('RidestoreApp')
  .filter('dynamicNameFilter', dynamicNameFilter);

  dynamicNameFilter.$inject = ['$filter'];

  function dynamicNameFilter($filter) {

    return function(array, text, key) {
      var expression = {};
      expression[key] = text;

      return $filter('filter')(array, expression);
    };

  }
}());
