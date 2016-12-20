(function() {
  'use strict';

  /**
  * @desc cart nav button to be used accross the app that displays the
  *    count of cart items in the list and when clicked opens the cart page
  * @example <rs-cart-nav-button device="mobile"></rs-cart-nav-button>
  */
  angular
  .module('RidestoreApp')
  .directive('rsCartNavButton', rsCartNavButton);

  function rsCartNavButton() {
    var directive = {
      templateUrl: 'app/components/cart/cart-nav-button/cart-nav-button.html',
      restrict: 'E',
      scope: {
        device: '<'
      },
      controller: 'CartNavButtonController',
      controllerAs: 'vm',
      bindToController: true // because the scope is isolated
    };

    return directive;

  }

}());
