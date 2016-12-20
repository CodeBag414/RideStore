(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('FlipButtonController', FlipButtonController);

  FlipButtonController.$inject = ['$scope'];

  function FlipButtonController($scope) {

    var vm = this;

    vm.buttonStyle = $scope.vm.buttonStyle;
    vm.callback = $scope.vm.callback;
    vm.flipOnce = $scope.vm.flipOnce;
    vm.isFlipped = false;

    vm.flipButton = flipButton;
    vm.getDisplayingSide = getDisplayingSide;
    vm.showBack = showBack;
    vm.showFront = showFront;

    activate();

    ////////////

    function activate() {
      $scope.$watch('vm.callback', function () {
        if (vm.callback !== 'undefined') {
          vm.callback(vm);
        }
      });
    }

    /**
     * @ngdoc function
     * @name flipButton
     * @description
     *     flips the button constantly unless flipOnce is set to true (allowing one flip).
     *     if a callback has been passed, then this function doesn't do anything.
     *     It is then up to the parent to call the showFront() and showBack() methods.
     */
    function flipButton() {
      if (typeof vm.callback === 'undefined') {
        if (vm.flipOnce === true) {
          vm.isFlipped = true;
        } else {
          vm.isFlipped = !vm.isFlipped;
        }
      }
    }

    function showFront() {
      vm.isFlipped = false;
    }

    function showBack() {
      vm.isFlipped = true;
    }

    /**
     * @ngdoc function
     * @name getDisplayingSide
     * @description provides the currently displayed side of the button
     *
     * @return {string} 'front'|'back' according to the side that is being displayed.
     */
    function getDisplayingSide() {
      if (vm.isFlipped) {
        return 'back';
      } else {
        return 'front';
      }
    }

  }}());
