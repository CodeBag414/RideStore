(function() {
  'use strict';

  angular
    .module('RidestoreApp')
    .factory('shoeSizeConverterService', shoeSizeConverterService);

  shoeSizeConverterService.$inject = ['$http', 'storageService', 'lodash', 'rsConfig'];
  function shoeSizeConverterService($http, storageService, lodash, rsConfig) {
    var LS_KEY_DISPLAY_SHOE_SIZES_IN_EUR = 'rs-shoe-sizes-in-eur';

    var _shoeSizeConverterTable;
    var _displayShoeSizesInEur = storageService.get(LS_KEY_DISPLAY_SHOE_SIZES_IN_EUR) || true;

    var service = {
      getBrandConversionTable: getBrandConversionTable,
      getBrandSizingDefaultUnit: getBrandSizingDefaultUnit,
      getSizeValueInEUR: getSizeValueInEUR,

      // User preferences
      displayShoeSizesInEur: displayShoeSizesInEur,
    };

    return service;

    ////////////////

    function getBrandConversionTable(brandId) {
      return _loadShoeSizeConversionTable().then(function(data) {
          _shoeSizeConverterTable = data;
          return getBrandSizes(brandId, data);
        }
      );
    }

    function getBrandSizingDefaultUnit(brandId) {
      if (!_shoeSizeConverterTable) {
        return;
      }

      var brandSize = getBrandSizes(brandId, _shoeSizeConverterTable);

      return brandSize.sizeDefaultUnit ? brandSize.sizeDefaultUnit : null;
    }

    function getSizeValueInEUR(brandId, sizeInDefaultUnit) {
      if (!_shoeSizeConverterTable) {
        return;
      }

      var brandSize = getBrandSizes(brandId, _shoeSizeConverterTable);

      var result = lodash.find(brandSize.sizes, function(o) {
        return o[brandSize.sizeDefaultUnit] === sizeInDefaultUnit + '';
      });

      if (result && result.eur) {
        return result.eur;
      }
      return;
    }

    function displayShoeSizesInEur(status) {
      if (status === true || status === false) {
        _displayShoeSizesInEur = status;
        storageService.set(LS_KEY_DISPLAY_SHOE_SIZES_IN_EUR, status);
      }
      return _displayShoeSizesInEur;
    }

    ////////////////

    function _loadShoeSizeConversionTable() {
      return $http.get(rsConfig.sizeConversionTables.shoes.url, { cache: true })
      .then(function(res) {
        return res.data;
      });
    }

    function getBrandSizes(brandId, data) {
      brandId = brandId + '';

      return lodash.pickBy(data, function(value, key) {
        return key === brandId;
      })[brandId];
    }
  }
})();
