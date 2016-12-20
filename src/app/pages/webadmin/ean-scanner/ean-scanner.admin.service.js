(function() {
  'use strict';

  angular
    .module('RidestoreApp.admin')
    .factory('eanScannerService', eanScannerService);

  eanScannerService.$inject = ['api', 'lodash'];
  function eanScannerService(api, lodash) {
    console.log('eanScannerService initialized');

    var products = [];

    var service = {
      addProductByEAN: addProductByEAN,
      clearProducts: clearProducts,
      getProducts: getProducts,
      isValidEAN: isValidEAN,
    };

    return service;

    ////////////////

    function addProductByEAN(ean) {
      return api.getSkuByEan(ean)
      .then(function(response) {
        response.data.ean = ean;
        products.push(response.data);
        products = lodash.uniqWith(products, lodash.isEqual);
        return products;
      });
    }

    function clearProducts() {
      products = [];
      return products;
    }

    function getProducts() {
      return products;
    }

    function isValidEAN(ean) {
      var lastDigit = parseInt(ean.charAt(ean.length - 1));
      var checkDigitCalculated = _eanCheckDigit(ean.substring(0, ean.length - 1));

      return checkDigitCalculated === lastDigit;
    }

    ////////////////

    //source http://stackoverflow.com/a/18762640/1740488
    function _eanCheckDigit(s) {
      var result = 0;
      for (var counter = s.length - 1; counter >= 0; counter--) {
        result = result + parseInt(s.charAt(counter)) * (1 + (2 * (counter % 2)));
      }
      return (10 - (result % 10)) % 10;
    }

  }
})();
