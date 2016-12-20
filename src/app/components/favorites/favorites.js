(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('FavoritesController', FavoritesController);

  FavoritesController.$inject = ['api', 'blazyService', 'favorites', 'lodash', 'rsConfig',
    'stylecreatorFactory', 'topFactory', '$scope', '$timeout', '$window'];

  function FavoritesController(api, blazyService, favorites, lodash, rsConfig,
    stylecreatorFactory, topFactory, $scope, $timeout, $window) {

    window.performanceMark('FavoritesController:start');

    var vm = this;

    vm.top = topFactory;
    vm.favorites = favorites.getFavorites();
    vm.productsDetails = [];

    vm.customStyleFavorites = favorites.getCustomStyleFavorites();

    vm.favoritesCount = favorites.getFavoritesCount();

    vm.shareableUrl = '';
    vm.showPopupShareUrl = false;
    vm.openFacebookPopup =  openFacebookPopup;

    vm.generateFavoritesUrl = generateFavoritesUrl;

    activate();

    ////////////

    function activate() {
      populateFavoritesProductsDetails();
      populateCustomStyleFavoritesAttributes();

      //listen to broadcast event on update of favorites
      $scope.$on('favorites:favoritesUpdated', function (event, args) {
        vm.favoritesCount = favorites.getFavoritesCount();
        vm.favorites = favorites.getFavorites();
        vm.customStyleFavorites = favorites.getCustomStyleFavorites();
        populateFavoritesProductsDetails();
        populateCustomStyleFavoritesAttributes();
        $timeout(function() {
          blazyService.revalidate();
        }, 250);
      });

    }

    /**
     * @ngdoc function
     * @name populateFavoritesProductsDetails
     * @description populates the productsDetails array with the response
     *      from the api.getProducts
     *
     */
    function populateFavoritesProductsDetails() {
      if (vm.favorites.length > 0) {
        api.getProducts(vm.favorites)
          .then(function successCallback(response) {
            vm.productsDetails = response.data.data;
          });
      } else {
        vm.productsDetails = [];
      }
    }

    function populateCustomStyleFavoritesAttributes() {
      populateCustomStyleFavoritesProductsDetails();
      populateCustomStyleFavoritesImagesAndUrls();
    }

    /**
     * @ngdoc function
     * @name populateCustomStyleFavoritesProductsDetails
     * @description populates the productsDetails array within each item of
     * customStyleFavorites with the response from the api.getProducts
     *
     */
    function populateCustomStyleFavoritesProductsDetails() {
      if (vm.customStyleFavorites.length > 0) {
        //flattening the array for reducing requests
        var tempAllStyleProducts = getFlatStyleProductsArray();

        api.getProducts(tempAllStyleProducts)
          .then(function successCallback(res) {
            var response = res.data.data;

            for (var i = 0; i < vm.customStyleFavorites.length; i++) {
              var customStyle = vm.customStyleFavorites[i];

              customStyle.productsDetails = [];
              for (var j = 0; j < customStyle.products.length; j++) {
                //api returns productIds as strings
                var productIdString = '' + customStyle.products[j];

                var productDetails = lodash.find(response, {id: productIdString});

                if (productDetails) {
                  customStyle.productsDetails.push(productDetails);
                }
              }

            }
          });
      } else {
        vm.customStyleProducsDetails = [];
      }
    }

    function populateCustomStyleFavoritesImagesAndUrls() {
      if (vm.customStyleFavorites.length === 0) {
        return;
      }

      for (var i = 0; i < vm.customStyleFavorites.length; i++) {
        var customStyle = vm.customStyleFavorites[i];

        customStyle.images = stylecreatorFactory.getImages(customStyle.department.id, customStyle.products);
        customStyle.url = stylecreatorFactory.getUrl(customStyle.department, customStyle.products);
      }
    }

    function toggleShare() {
      vm.showPopupShareUrl = !vm.showPopupShareUrl;
      if (vm.showPopupShareUrl) {
        generateFavoritesUrl();
      }
    }

    function openFacebookPopup(url) {
      $window.open(url, 'Share to Facebook', 'status = 1, height = 500, width = 360, resizable = 0');
    }

    ////////////

    function generateFavoritesUrl() {
      vm.shareableUrl = favorites.generateFavoritesUrl();
      vm.shareFacebookUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(vm.shareableUrl);
    }

    function getFlatStyleProductsArray() {
      var tempAllStyleProducts = [];

      for (var i = 0; i < vm.customStyleFavorites.length; i++) {
        var tmpProducts = vm.customStyleFavorites[i].products;
        for (var j = 0; j < tmpProducts.length; j++) {
          var tmpProduct = tmpProducts[j];

          // making sure we are not adding more than once
          if (tempAllStyleProducts.indexOf(tmpProduct) === -1) {
            tempAllStyleProducts.push(tmpProduct);
          }
        }
      }
      return tempAllStyleProducts;
    }

    window.performanceMark('FavoritesController:end');

    window.performanceMeasure('FavoritesController', 'FavoritesController:start', 'FavoritesController:end');

  }

})();
