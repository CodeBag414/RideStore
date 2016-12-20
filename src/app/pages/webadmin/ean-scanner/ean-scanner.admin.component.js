(function() {
  'use strict';

  angular
    .module('RidestoreApp.admin')
    .component('eanScanner', {
      templateUrl: 'app/pages/webadmin/ean-scanner/ean-scanner.admin.html',
      controller: EanScannerController,
    });

  EanScannerController.$inject = ['adminAuthenticationService',
    'eanScannerService', '$state', '$timeout', '$window'];
  function EanScannerController(adminAuthenticationService,
    eanScannerService, $state, $timeout, $window) {

    var $ctrl = this;

    $ctrl.ean = '';
    $ctrl.validationEnabled = false;
    $ctrl.products = eanScannerService.getProducts();

    $ctrl.addProductByEAN = addProductByEAN;
    $ctrl.clearInput = clearInput;
    $ctrl.clearProducts = clearProducts;
    $ctrl.go = $state.go;
    $ctrl.isAdmin = adminAuthenticationService.isAdmin;
    $ctrl.isValidEAN = isValidEAN;
    $ctrl.triggerCopyToClipboard = triggerCopyToClipboard;

    ////////////////

    $ctrl.$onInit = activate();
    $ctrl.$onChanges = function(changesObj) { };
    $ctrl.$onDestroy = function() {
      delete $ctrl.barcode;
    };

    ////////////////

    function activate() {
      console.log('eanScannerController initiated');
      $timeout(function() {createBarCode('Scan a product');}, 500);
    }

    function addProductByEAN() {
      if (($ctrl.validationEnabled && isValidEAN()) || !$ctrl.validationEnabled) {
        createBarCode();

        eanScannerService.addProductByEAN($ctrl.ean)
        .then(function(response) {
          $ctrl.products = response;
        });

        clearInput();
      } else {
        console.error('not a valid EAN', $ctrl.ean);
      }
    }

    function isValidEAN() {
      return $ctrl.ean.length > 0 ? eanScannerService.isValidEAN($ctrl.ean) : false;
    }

    function createBarCode(text) {
      /* global JsBarcode */
      /* jshint -W064 */
      if ($window.JsBarcode) {
        if (text) {
          $ctrl.barcode = JsBarcode('#barcode', text);
        } else {
          $ctrl.barcode = JsBarcode('#barcode', $ctrl.ean);
        }
      }
    }

    function triggerCopyToClipboard() {
      for (var i = 0 ; i < $ctrl.products.length; i++) {
        copyToClipboard($ctrl.products[i].configurableSku);
      }
    }

    function copyToClipboard(text) {
      $window.prompt('Copy to clipboard: Ctrl+C, Enter', text);
    }

    function updateProducts() {
      $ctrl.products = eanScannerService.getProducts();
    }

    function clearInput() {
      $ctrl.ean = '';
    }

    function clearProducts() {
      $ctrl.products = eanScannerService.clearProducts();
    }

  }
})();
