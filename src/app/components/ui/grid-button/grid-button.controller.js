(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('GridButtonController', GridButtonController);

  GridButtonController.$inject = ['$scope', 'blazyService', 'gridService'];

  function GridButtonController($scope, blazyService, gridService) {

    var vm = this;

    vm.usingBlazy = $scope.vm.usingBlazy;
    vm.callback = $scope.vm.callback;

    vm.toggleSize = toggleSize;
    vm.getSize = getSize;

    activate();

    ////////////

    function activate() {
      $scope.$watch('vm.usingBlazy', function () {
        if (vm.usingBlazy !== 'undefined') {
          vm.usingBlazy = $scope.vm.usingBlazy;
        }
      });
      $scope.$watch('vm.callback', function () {
        if (vm.callback !== 'undefined') {
          vm.callback = $scope.vm.callback;
        }
      });
    }

    /**
     * @ngdoc function
     * @name toggleSize
     * @description
     *     toggles the grid size and if using blazy, revalidates it
     */
    function toggleSize() {
      gridService.toggleSize();
      if (vm.usingBlazy) {
        blazyService.revalidate();
        blazyService.removeFixedSize();
      }
      if (vm.callback) {
        vm.callback();
      }
    }

    function getSize() {
      return gridService.getSize();
    }

  }}());
