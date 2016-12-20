(function() {
  'use strict';

  angular
  .module('RidestoreApp.admin')
  .component('adminCategoryRow', {
    templateUrl: 'app/pages/category/admin-top-row/category-row.admin.html',
    controller: CategoryRowAdminController,
    bindings: {
      sortOrder: '=',
      category: '=',
      products: '=',
      isChangeOrderMode: '=',
      haveAChange: '='
    },
  });

  CategoryRowAdminController.$inject = ['api','$scope','lodash','$rootScope'];
  function CategoryRowAdminController(api, $scope, lodash, $rootScope) {
    var $ctrl = this;
    $ctrl.updatedOrder = false;
    $ctrl.setAutomaticSorting = setAutomaticSorting;
    $ctrl.saveSortOrder = saveSortOrder;
    $ctrl.toggleChangeOrderMode = toggleChangeOrderMode;

    $scope.$watch('$ctrl.sortOrder', function() {
      $ctrl.automaticSorting = $ctrl.sortOrder === 'rank';
    });

    $rootScope.$on('updatedOrder', function(event, data) {
      $ctrl.updatedOrder = true;
    });

    function setAutomaticSorting() {
      var sortOrder;
      if ($ctrl.automaticSorting) {
        sortOrder = 'rank';
        $ctrl.isChangeOrderMode = false;
      } else {
        sortOrder = 'position';
      }
      api.setCategorySortOrder($ctrl.category,sortOrder).then(function () {
        $rootScope.$emit('updateCategory',{sortMode:sortOrder});
      });
    }

    function saveSortOrder() {
      $ctrl.updatedOrder = false;
      api.saveSortOrder($ctrl.category, lodash.map($ctrl.products, 'id'));
    }

    function toggleChangeOrderMode() {
      $ctrl.isChangeOrderMode = !$ctrl.isChangeOrderMode;
      if ($ctrl.isChangeOrderMode) {
        $ctrl.automaticSorting = false;
        var sortOrder = 'position';
        api.setCategorySortOrder($ctrl.category, sortOrder).then(function () {
          $rootScope.$emit('updateCategory',{sortMode:sortOrder});
        });
      }
    }

  }
})();
