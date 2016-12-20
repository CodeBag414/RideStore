(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('FavoriteNavButtonController', FavoriteNavButtonController);

  FavoriteNavButtonController.$inject = ['favorites', 'topFactory', '$scope'];

  function FavoriteNavButtonController(favorites, topFactory, $scope) {

    var vm = this;

    activate();

    ////////////

    function activate() {
      vm.favoritesCount = favorites.getFavoritesCount();
      vm.top = topFactory;
      vm.device = $scope.vm.device;

      // need to use a watcher as the device is not updated automagically within
      $scope.$watch('vm.device', function() {
        vm.device = $scope.vm.device;
      });

      //listen to broadcast event on update of favorites
      $scope.$on('favorites:favoritesUpdated', function (event, args) {
        vm.favoritesCount = args.favorites.count;
      });

    }

  }}());
