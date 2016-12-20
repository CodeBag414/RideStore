/* global blazy */
(function() {
  'use strict';

  angular
  .module('RidestoreApp.admin')
  .component('adminCategoryChangeOrderProductListing', {
    templateUrl: 'app/pages/category/admin-product-listing/category-change-order-product-listing.admin.html',
    controller: AdminCategoryChangeOrderProductListing,
    bindings: {
      products: '=',
      totalVisible: '=',
      startIndex: '=',
    },
  });

  AdminCategoryChangeOrderProductListing.$inject = ['$rootScope'];
  function AdminCategoryChangeOrderProductListing($rootScope) {
    console.log('adminCategoryChangeOrderProductListing');
    var $ctrl = this;
    $ctrl.onDndMoved = onDndMoved;

    function onDndMoved(index) {
      $ctrl.products.splice(index, 1);
      blazy.revalidate();
      $rootScope.$emit('updatedOrder');
    }
  }
})();
