(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('SizeGuideController', SizeGuideController);

  SizeGuideController.$inject = ['$scope', '$uibModalInstance', 'content'];

  function SizeGuideController($scope, $uibModalInstance, content) {

    var vm = this;

    vm.close = close;
    vm.content = content;

    function close() {
      $uibModalInstance.close('closing');
    }

  }
}());
