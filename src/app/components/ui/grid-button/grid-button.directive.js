(function() {
  'use strict';

  /**
  * @desc grid button to be used accross the app
  *
  * @param {boolean} [using-blazy] optional parameter that if set to true, then blazy
  *   will be revalidated every time the button is toggled
  *
  * @param {function} [callback] optional parameter that is called when toggling button
  *
  * @example
  *   <rs-grid-button using-blazy="true" callback="callback"></rs-grid-button>
  */
  angular
  .module('RidestoreApp')
  .directive('rsGridButton', rsGridButton);

  function rsGridButton() {
    var directive = {
      templateUrl: 'app/components/ui/grid-button/grid-button.html',
      restrict: 'E',
      scope: {
        usingBlazy: '<?',
        callback: '<?',
      },
      controller: 'GridButtonController',
      controllerAs: 'vm',
      bindToController: true // because the scope is isolated
    };

    return directive;
  }

}());
