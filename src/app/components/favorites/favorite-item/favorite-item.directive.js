(function() {
  'use strict';

  /**
  * @desc favorite item to be used on the favorites grid
  * @example <rs-favorite-item product="product"></rs-favorite-item>
  */
  angular
  .module('RidestoreApp')
  .directive('rsFavoriteItem', rsFavoriteItem);

  function rsFavoriteItem() {
    var directive = {
      templateUrl: 'app/components/favorites/favorite-item/favorite-item.html',
      restrict: 'E',
      scope: {
        product: '<',
      },
      controller: 'FavoriteItemController',
      controllerAs: 'vm',
      bindToController: true // because the scope is isolated
    };

    return directive;
  }

}());
