/**
* SharedFavoritesController
*
* Ridestore AB
*/
(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('SharedFavoritesController', SharedFavoritesController);

  SharedFavoritesController.$inject = ['$scope', '$stateParams', 'api',
    'favorites', 'gridService'];

  function SharedFavoritesController($scope, $stateParams, api,
      favorites, gridService) {

    var vm = this;
    vm.gridService = gridService;
    vm.sharedFavorites = [];
    vm.productsDetails = [];
    vm.key = 'sf'; //sf - sharedFavorites, used in routes.js

    activate();

    ////////////

    function activate() {
      setSharedFavoritesFromUrl();
      populateFavoritesProductsDetails();
    }

    /**
     * @ngdoc function
     * @name populateFavoritesProductsDetails
     * @description populates the productsDetails array with the response
     *      from the api.getProducts
     *
     */
    function populateFavoritesProductsDetails() {
      api.getProducts(vm.sharedFavorites)
        .then(function successCallback(response) {
          vm.productsDetails = response.data.data;
        });
    }

    /**
     * @ngdoc function
     * @name setSharedFavoritesFromUrl
     * @description processes the 'sf' parameter from the url and
     *    sets the sharedFavorites array with the list of productIds.
     */
    function setSharedFavoritesFromUrl() {
      vm.sharedFavorites = readArrayFromUrl(vm.key);
    }

    /**
     * @ngdoc function
     * @name readArrayFromUrl
     * @description processes the 'key' parameter from the url and
     *    returns the parsed array for that parameter.
     */
    function readArrayFromUrl(key) {
      var arr = [];

      //TODO: might want to validate this input
      if ($stateParams.hasOwnProperty(key) &&
          $stateParams[key] !== undefined) {
        arr = JSON.parse($stateParams[key]);
      }

      return arr;
    }

  }

})();
