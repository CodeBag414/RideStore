/* global blazy */
(function() {
  'use strict';

  angular
  .module('RidestoreApp.admin')
  .component('adminCategorySetColorProductListing', {
    templateUrl: 'app/pages/category/admin-product-listing/category-set-color-product-listing.admin.html',
    controller: AdminCategorySetColorProductListing,
    bindings: {
      products: '=',
      totalVisible: '=',
      startIndex: '='
    },
  });

  AdminCategorySetColorProductListing.$inject = ['api','$scope'];
  function AdminCategorySetColorProductListing(api, $scope) {
    var $ctrl = this;
    $ctrl.pickColor = pickColor;
    var guessId = 0;
    var haveStartedGuessingColor = false;
    $scope.$watch('$ctrl.products', function() {
      if ($ctrl.products.length > 0 && !haveStartedGuessingColor) {
        haveStartedGuessingColor = true;
        guessNext();
        guessNext();//starting 2 request loops
      }
    });

    function guessNext() {
      if (guessId >= $ctrl.products.length) {
        return;
      }
      var product = $ctrl.products[guessId];
      guessId++;
      api.guessColor(product.id).then(function (data) {
        product.colors = data.colors;
        guessNext();
      });
    }

    function pickColor(product,color) {
      product.openColorPicker = false;
      product.acceptedColor = true;
      var index = product.colors.indexOf(color);
      product.colors.splice(index,1);
      product.colors.unshift(color);
      api.setColor(product.id, color.id);
    }
  }
})();
