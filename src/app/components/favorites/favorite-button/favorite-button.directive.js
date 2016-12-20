(function() {
  'use strict';

  /**
  * @desc favorite button to be used accross the app
  * @example <rs-favorite-button product-id="product.id"></rs-favorite-button>
  */
  angular
  .module('RidestoreApp')
  .directive('rsFavoriteButton', rsFavoriteButton);

  function rsFavoriteButton() {
    var directive = {
      templateUrl: 'app/components/favorites/favorite-button/favorite-button.html',
      restrict: 'E',
      scope: {
        productId: '<' //one way
      },
      controller: 'FavoriteButtonController',
      controllerAs: 'vm',
      bindToController: true // because the scope is isolated
    };

    return directive;
  }

}());
