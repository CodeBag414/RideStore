(function() {
  'use strict';

  angular
    .module('RidestoreApp.admin')
    .component('adminProductRow', {
      templateUrl: 'app/pages/stylecreator/product-row/product-row.admin.html',
      controller: ProductRowAdminController,
      bindings: {
        product: '=',
        department: '=',
      },
    });

  ProductRowAdminController.$inject = ['api', 'adminAuthenticationService', 'rsConfig',
      'stylecreatorConfig', 'stylecreatorEditorService', '$window'];
  function ProductRowAdminController(api, adminAuthenticationService, rsConfig,
      stylecreatorConfig, stylecreatorEditorService, $window) {
    var $ctrl = this;

    $ctrl.changeStatus = changeStatus;
    $ctrl.downloadProductAssets = downloadProductAssets;
    $ctrl.incrementCaching = incrementCaching;
    $ctrl.style = stylecreatorConfig.style;

    ////////////////

    $ctrl.$onInit = function() { };
    $ctrl.$onChanges = function(changesObj) { };
    $ctrl.$onDestroy = function() { };

    ////////////////

    function changeStatus(status, $event) {
      $event.stopPropagation();
      $ctrl.product.status = status;
      api.setProductStylecreatorStatus($ctrl.product.id, $ctrl.product.status, $ctrl.department.id);
      //TODO remove product?
    }

    function downloadProductAssets($event) {
      $event.stopPropagation();

      var url = rsConfig.stylecreatorAdminApiBaseUrl + 'downloadImages';

      var params = {
        productId: 'productId=' + $ctrl.product.id,
        department: 'department=' + $ctrl.department.id,
        Authorization: 'Authorization=Bearer ' + adminAuthenticationService.getAdminToken(),
      };

      var href = url + '?' + params.productId + '&' + params.department + '&' + params.Authorization;

      $window.open(href, '_blank');
    }

    function incrementCaching($event) {
      $event.stopPropagation();

      api.incrementStylecreatorCaching($ctrl.product.id, $ctrl.department.id);
    }
  }
})();
