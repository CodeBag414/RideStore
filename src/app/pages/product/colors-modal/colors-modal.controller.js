(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('ColorsModalController', ColorsModalController);

  ColorsModalController.$inject = ['$scope', '$state', '$uibModalInstance', 'colors'];

  function ColorsModalController($scope, $state, $uibModalInstance, colors) {

    var vm = this;

    vm.close = close;
    vm.colors = colors;
    vm.goToProduct = goToProduct;

    function close() {
      $uibModalInstance.close('closing');
    }

    function goToProduct(params) {
      $state.go('product-configurable', params);
      close();
    }

  }
}());
