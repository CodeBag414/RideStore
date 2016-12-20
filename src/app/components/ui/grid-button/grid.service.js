/**
* Grid service, maintains the grid state accross the app
*
* Ridestore AB
*/
(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('gridService', gridService);

  gridService.$inject = ['$window', 'storageService', 'rsConfig'];

  function gridService($window, storageService, rsConfig) {
    var size;
    setSize();

    var service = {
      setSize: setSize,
      getSize: getSize,
      getItemsPerRow: getItemsPerRow,
      toggleSize: toggleSize,
    };

    return service;

    ////////////

    function setSize(items) {
      if (!items) {
        var defaultItems = rsConfig.gridParams.items;
        if ($window.innerWidth <= 320) {
          defaultItems = 2;
        }
        items = parseInt(storageService.get('gridItems')) || defaultItems;
      } else {
        storageService.set('gridItems', items);
        items = parseInt(items);
      }
      size = items;
    }

    function getSize() {
      return size;
    }

    /**
     * @ngdoc function
     * @name getItemsPerRow
     * @description helper function that returns the amount of ".objects" in a ".grid"
     * row according to the css rules in ui.scss
     */
    function getItemsPerRow() {
      var windowWidth = $window.innerWidth;
      var gridSize = getSize();

      switch (gridSize) {
        case 2:
          if (windowWidth < 1024) { return 2; }
          else if (windowWidth < 2000) { return 4; }
          else { return 5; }
          break;
        case 3:
          if (windowWidth < 1024) { return 3; }
          else if (windowWidth < 2000) { return 5; }
          else { return 6; }
          break;
        default:
          console.error('error in getItemsPerRow, expected 2 or 3, got: ' + size);
          return 3;
      }
    }

    function toggleSize() {
      if (size === 2) {
        setSize(3);
      } else {
        setSize(2);
      }
    }

  }

}());
