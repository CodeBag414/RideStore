(function() {
  'use strict';

  /**
  * @desc spinner to be used accross the app that displays an
  *     input box with a value and buttons to increment/decrement that value
  *
  * @example
  *   <rs-quantity-spinner quantity="vm.quantity" model="vm.model"
  *      change-callback="vm.calbackFunction"></rs-quantity-spinner>
  */
  angular
  .module('RidestoreApp')
  .directive('rsQuantitySpinner', rsQuantitySpinner);

  function rsQuantitySpinner() {
    var directive = {
      templateUrl: 'app/components/ui/quantity-spinner/quantity-spinner.html',
      restrict: 'E',
      scope: {
        changeCallback: '=',
        model: '<?',
        quantity: '=',
        showSpinner: '='
      },
      controller: 'QuantitySpinnerController',
      controllerAs: 'vm',
      bindToController: true // because the scope is isolated
    };

    return directive;

  }

}());
