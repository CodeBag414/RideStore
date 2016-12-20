(function() {
  'use strict';

  /**
  * @desc custom style favorite item to be used on the favorites grid
  * @example <rs-custom-style-favorite-item product="product"></rs-custom-style-favorite-item>
  */
  angular
  .module('RidestoreApp')
  .directive('rsCustomStyleFavoriteItem', rsCustomStyleFavoriteItem);

  function rsCustomStyleFavoriteItem() {
    var directive = {
      templateUrl: 'app/components/favorites/custom-style-favorite-item/custom-style-favorite-item.html',
      restrict: 'E',
      scope: {
        product: '<',
      },
      controller: 'CustomStyleFavoriteItemController',
      controllerAs: 'vm',
      bindToController: true // because the scope is isolated
    };

    return directive;
  }

}());
