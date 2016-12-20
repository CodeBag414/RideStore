(function() {
  'use strict';

  /**
  * @desc flip button to be used accross the app
  *
  * @param {boolean} [flip-once] optional parameter that allows the button to flip only once
  * @param {function} [callback] optional function that will receive the FlipButton as a parameter
  * @param {Object} [button-style] optional paramter to override the style of the button
  *
  * @example
  *   <rs-flip-button flip-once="true" button-style="{height: '65px'}" callback="iWillReceiveTheControllerAsParameter">
  *     <button-front>
  *       <a href="" ng-click="doSomething()" class="button button-full bg-green">FRONT</a>
  *     </button-front>
  *
  *     <button-back>
  *       <a href="" ng-click="doSomethingElse()" class="button button-full bg-red">BACK</a>
  *     </button-back>
  *   </rs-flip-button>
  */
  angular
  .module('RidestoreApp')
  .directive('rsFlipButton', rsFlipButton);

  function rsFlipButton() {
    var directive = {
      templateUrl: 'app/components/ui/flip-button/flip-button.html',
      restrict: 'E',
      scope: {
        buttonStyle: '<?',
        callback: '<?',
        flipOnce: '<?',
      },
      transclude: {
        'button-front': 'buttonFront',
        'button-back': 'buttonBack',
      },
      controller: 'FlipButtonController',
      controllerAs: 'vm',
      bindToController: true // because the scope is isolated
    };

    return directive;
  }

}());
