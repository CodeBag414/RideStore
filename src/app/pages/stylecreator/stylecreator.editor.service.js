(function() {
  'use strict';

  angular
    .module('RidestoreApp')
    .factory('stylecreatorEditorService', stylecreatorEditorService);

  stylecreatorEditorService.$inject = ['adminAuthenticationService', 'api',
      'stylecreatorFactory', 'lodash', 'rsConfig'];
  function stylecreatorEditorService(adminAuthenticationService, api,
      stylecreatorFactory, lodash, rsConfig) {
    var _isEditMode = false;

    var service = {
      isEditMode: isEditMode,
      toggleEditMode: toggleEditMode,
      getDownloadCropStyleImageLink: getDownloadCropStyleImageLink,
      getDownloadFullResLinks: getDownloadFullResLinks,
      saveStyle: saveStyle,
    };

    return service;

    ////////////////

    function toggleEditMode() {
      _isEditMode = !_isEditMode;
    }

    function isEditMode() {
      return _isEditMode;
    }

    function getDownloadCropStyleImageLink(departmentId, products, cropType) {
      var url = rsConfig.stylecreatorAdminApiBaseUrl + 'cropStyleImage';

      var params = {
        products: 'products=' + JSON.stringify(preprocessProducts(products)),
        type: 'type=' + cropType,
        department: 'department=' + departmentId,
        Authorization: 'Authorization=Bearer ' + adminAuthenticationService.getAdminToken(),
      };

      return url + '?' + params.department + '&' + params.department +
        '&' + params.type + '&' + params.products + '&' + params.Authorization;
    }

    function getDownloadFullResLinks(departmentId, products) {
      return {
        front: stylecreatorFactory.getImages(departmentId, products).front + '&fullres=1',
        back: stylecreatorFactory.getImages(departmentId, products).back + '&fullres=1'
      };
    }

    function saveStyle(styleImage, selectedProducts, brandId, department) {
      return api.addStyle(styleImage, selectedProducts, brandId, department.name);
    }

    ////////////////

    function preprocessProducts(products) {
      var productsArr = [].concat(products); //make sure we're array

      return lodash.map(productsArr,function(productId) {
        return {'product_id': productId};
      });
    }

  }
})();
