(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('CustomStyleFavoriteItemController', CustomStyleFavoriteItemController);

  CustomStyleFavoriteItemController.$inject = ['favorites', '$scope'];

  function CustomStyleFavoriteItemController(favorites, $scope) {

    var vm = this;

    vm.product = $scope.$parent.customStyleProduct;

    activate();

    function activate() {

    }

    vm.removeCustomStyleFromFavorites = removeCustomStyleFromFavorites;

    function removeCustomStyleFromFavorites() {
      favorites.removeCustomStyleFromFavorites(vm.product.products);
    }

  }}());
