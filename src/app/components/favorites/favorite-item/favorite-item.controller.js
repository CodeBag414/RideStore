(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('FavoriteItemController', FavoriteItemController);

  FavoriteItemController.$inject = ['favorites', '$scope'];

  function FavoriteItemController(favorites, $scope) {

    var vm = this;

    vm.product = $scope.$parent.product;

    vm.removeFromFavorites = removeFromFavorites;

    function removeFromFavorites() {
      favorites.removeFromFavorites(vm.product.id);
    }

  }}());
