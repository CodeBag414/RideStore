(function() {
  'use strict';

  /**
  * @desc favorite nav button to be used accross the app that displays the
  *    count of favorites in the list and when clicked opens the favorites page
  * @example <rs-favorite-nav-button device="mobile"></rs-favorite-nav-button>
  */
  angular
  .module('RidestoreApp')
  .directive('rsFavoriteNavButton', rsFavoriteNavButton);

  function rsFavoriteNavButton() {
    var directive = {
      templateUrl: 'app/components/favorites/favorite-nav-button/favorite-nav-button.html',
      restrict: 'E',
      scope: {
        device: '<'
      },
      controller: 'FavoriteNavButtonController',
      controllerAs: 'vm',
      bindToController: true // because the scope is isolated
    };

    return directive;

  }

}());
