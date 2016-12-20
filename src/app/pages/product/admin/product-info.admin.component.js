(function() {
  'use strict';

  angular
  .module('RidestoreApp.admin')
  .component('adminProductInfo', {
    templateUrl: 'app/pages/product/admin/product-info.admin.html',
    controller: ProductInfoAdminController,
    bindings: {
      data: '<',
    },
  });

  ProductInfoAdminController.$inject = [];
  function ProductInfoAdminController() {
    var $ctrl = this;
    $ctrl.adminEditUrl = 'http://www.ridestore.se/index.php/admin/catalog_product/edit/id/';

  }
})();
