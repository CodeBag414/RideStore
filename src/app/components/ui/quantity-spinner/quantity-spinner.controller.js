(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('QuantitySpinnerController', QuantitySpinnerController);

  QuantitySpinnerController.$inject = ['$scope'];

  function QuantitySpinnerController($scope) {

    var vm = this;

    vm.decrease = decrease;
    vm.increase = increase;

    activate();

    ////////////

    function activate() {
      vm.model = $scope.vm.model;
      vm.changeCallback = $scope.vm.changeCallback;
      vm.quantity = $scope.vm.quantity;
      vm.showSpinner = $scope.vm.showSpinner;

      // need to use a watcher as the quantity is not updated automagically within
      $scope.$watch('vm.quantity', function() {
        vm.quantity = $scope.vm.quantity;
      });

    }

    function decrease() {
      vm.changeCallback(vm.model, -1);
    }

    function increase() {
      vm.changeCallback(vm.model, 1);
    }

  }}());
