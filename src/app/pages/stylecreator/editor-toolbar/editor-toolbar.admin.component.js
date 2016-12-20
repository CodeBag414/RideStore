(function() {
  'use strict';

  angular
    .module('RidestoreApp.admin')
    .component('editorToolbar', {
      templateUrl: 'app/pages/stylecreator/editor-toolbar/editor-toolbar.admin.html',
      controller: EditorToolbarController,
      bindings: {
        products: '=',
        department: '=',
      }
    });

  EditorToolbarController.$inject = ['stylecreatorEditorService', '$window'];
  function EditorToolbarController(stylecreatorEditorService, $window) {
    var $ctrl = this;

    $ctrl.toggleEditMode = stylecreatorEditorService.toggleEditMode;
    $ctrl.isEditMode = stylecreatorEditorService.isEditMode;
    $ctrl.downloadCropStyleImage = downloadCropStyleImage;
    $ctrl.openFullResImages = openFullResImages;

    ////////////////

    $ctrl.$onInit = function() { };
    $ctrl.$onChanges = function(changesObj) { };
    $ctrl.$onDestroy = function() { };

    ////////////////

    function openFullResImages() {
      var hrefs = stylecreatorEditorService.getDownloadFullResLinks($ctrl.department.id, $ctrl.products);

      $window.open(hrefs.front, '_blank');
      $window.open(hrefs.back, '_blank');
    }

    function downloadCropStyleImage() {
      var cropType = 'torso';

      var href = stylecreatorEditorService.getDownloadCropStyleImageLink($ctrl.department.id, $ctrl.products, cropType);
      $window.open(href, '_blank');
    }
  }
})();
