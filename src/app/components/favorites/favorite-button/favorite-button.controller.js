(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('FavoriteButtonController', FavoriteButtonController);

  FavoriteButtonController.$inject = ['favorites', '$scope'];

  function FavoriteButtonController(favorites, $scope) {

    var vm = this;

    vm.productId = $scope.vm.productId;
    vm.toggleFavorite = toggleFavorite;
    vm.isFavorite = false;

    activate();

    ////////////

    function activate() {

      // need to use a watcher as the productId is not updated automagically within
      $scope.$watch('vm.productId', function() {
        vm.productId = $scope.vm.productId;
        updateFavoriteStatus();
      });

      //listen to broadcast event on update of favorites
      $scope.$on('favorites:favoritesUpdated', function (event, args) {
        updateFavoriteStatus();
      });

    }

    function toggleFavorite() {
      if (vm.isFavorite) {
        removeFromFavorites();
      } else {
        addToFavorites();
      }
      updateFavoriteStatus();
    }

    function addToFavorites() {
      favorites.addToFavorites(vm.productId);
    }

    function removeFromFavorites() {
      favorites.removeFromFavorites(vm.productId);
    }

    function updateFavoriteStatus() {
      vm.isFavorite = favorites.isFavorite(vm.productId);
    }

  }}());
