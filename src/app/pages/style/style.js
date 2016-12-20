
/**
* Style product
*
* Ridestore AB
*/
(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('StyleController', StyleController);

  StyleController.$inject = ['$stateParams', '$location', '$q',
    'api', 'cart', 'head', 'locale', 'rsConfig', 'topFactory', 'gettext', 'toastr', 'segment', 'tracking', 'lodash'];

  function StyleController($stateParams, $location, $q,
      api, cart, head, locale, rsConfig, topFactory, gettext, toastr, segment, tracking, lodash) {
    /* jshint -W106 */
    /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
    var vm = this;
    vm.mediaPath = rsConfig.mediaPath;
    vm.head = head;
    vm.top = topFactory;
    vm.currency = locale.getStore().currency;
    vm.totalPrice = 0;
    vm.sizeError = false;
    vm.activeSizeSelector = '';
    vm.toggleProduct = toggleProduct;
    vm.buyStyle = buyStyle;
    vm.cartIsLoading = false;
    vm.getSizes = getSizes;
    vm.setSize = setSize;
    vm.flipButtonCallback = flipButtonCallback;

    activate();

    ////////////

    function activate() {
      //set url manually without reloading state.
      setUrl(); //using $stateParams

      if ($stateParams.id) {
        var endpointUrl = 'styles/' + $stateParams.id;
        api.performJsonpRequest(endpointUrl)
        .then(function(res) {
          vm.data = res.data;

          setUrl(vm.data.url);

          //add active status to all products in stock
          vm.data.products = vm.data.products.map(function(product) {
            product.stock_status = parseInt(product.stock_status);
            if (product.stock_status === 1) {
              product.active = true;
            }
            else {
              product.active = false;
            }
            product.selectedSize = '';
            return product;
          });
          calcTotalSum();
          //set head meta tags
          head.setTitle(vm.data.brand + ' style - Ridestore');
          //tracking
          trackView();
          tracking.page(vm.data.brand + ' style - Ridestore');
        }, function(reason) {
          var message = gettext('Error loading styles.');
          api.displayErrorToast(message, reason);
          return $q.reject(reason);
        });
      }
    }

    /**
     * @ngdoc function
     * @name setUrl
     * @description set the url manually from a given url in case
     *    the url is not set yet, or from $stateParams
     *
     * @param {String} [url=undefined] if url is passed, then attempts to set the url
     *
     */
    function setUrl(url) {
      if (url) {
        if ($location.url() === '/') { //if it has not already been set
          $location.url('/' + url);
        }
      } else {
        if ($stateParams.url) {
          $location.url($stateParams.url);
        }
      }
    }

    function calcTotalSum() {
      var sum = vm.data.products.reduce(function(total, product) {
        if (product.active) {
          total = total + parseFloat(product.sale_price || product.price);
        }
        return total;
      }, 0);
      vm.totalPrice = sum;
    }

    function toggleProduct(product) {
      product.active = !product.active;
      calcTotalSum();
    }

    function buyStyle() {
      vm.sizeError = false;
      var products = [];
      //check if all active products have a chosen size
      for (var i = 0; i < vm.data.products.length; i++) {
        var productId = vm.data.products[i].id;
        var sizeId = vm.data.products[i].selectedSize.id;
        if (vm.data.products[i].active && !vm.data.products[i].selectedSize) {
          vm.sizeError = true;
          break;
        }
        else if (vm.data.products[i].active) {
          //product has size and is active, should be added
          products.push({'productId': productId, 'sizeId': sizeId});
        }
      }
      if (!vm.sizeError) {
        //all active products had a chosen size, add all to cart.

        if (cart.getCart().cartId) {
          addToCart(products);
        } else {
          //if we don't have a cartId, we initiate it
          cart.refreshCart().then(function(result) {
            addToCart(products);
          });
        }
      } else {
        var message = gettext('You need to select a size in all items');
        toastr.error(message);
      }
    }

    function addToCart(products) {
      for (var i = 0; i < products.length; i++) {
        vm.successCounter = 0;
        vm.cartIsLoading = true;
        var productId = products[i].productId;
        var sizeId = products[i].sizeId;
        cart.addToCart(productId, sizeId)
        .then(function(res) {
          if (res.status === 'success') {
            vm.successCounter = vm.successCounter + 1;
            trackAddToCart(res.cartId, res.configId);
          }
          if (vm.successCounter === products.length) {
            showSuccessAddingToCart();
            vm.cartIsLoading = false;
            trackAddToCartComplete(res.cartId);
          }
        });
      }
    }

    function getAllSizes() {
      if (vm.data.products) {
        for (var i = 0; i < vm.data.products.length; i++) {
          getSizes(vm.data.products[i]);
        }
      }
    }

    function getSizes(product) {
      var endpointUrl = 'products/' + product.id + '/sizes';
      api.performJsonpRequest(endpointUrl)
      .then(function(res) {
        product.sizes = res.data;
        vm.activeSizeSelector = product.id;
      }, function(reason) {
        var message = gettext('Error loading product sizes.');
        api.displayErrorToast(message, reason);
        return $q.reject(reason);
      });
    }

    function setSize(product, size) {
      product.selectedSize = size;
      vm.activeSizeSelector = '';
    }

    function showSuccessAddingToCart() {
      vm.flipButton.showBack();
    }

    /**
     * @ngdoc function
     * @name flipButtonCallback
     * @description sets the flipButton object once the flipButton is ready
     */
    function flipButtonCallback(flipButton) {
      vm.flipButton = flipButton;
    }

    function trackView() {
      segment.track(segment.events.STYLE_VIEWED, getStyleInfoForTracking());
    }

    /**
     * @ngdoc function
     * @name trackAddToCart
     * @description tracks each single product added to cart
     */
    function trackAddToCart(cartId, productId) {
      var productCartData = getProductInfoForTracking(productId);
      productCartData.cart_id = cartId;
      segment.track(segment.events.PRODUCT_ADDED, productCartData);
    }

    /**
     * @ngdoc function
     * @name trackAddToCartComplete
     * @description tracks on add to cart complete that product(s) has been added from a style
     */
    function trackAddToCartComplete(cartId) {
      var productCartData = getStyleInfoForTracking();
      productCartData.cart_id = cartId;
      segment.track(segment.events.PRODUCTS_ADDED_FROM_STYLE, productCartData);
    }

    /**
     * @ngdoc function
     * @name getStyleInfoForTracking
     * @description get tracking data for the style
     */
    function getStyleInfoForTracking() {
      return {
        product_id: vm.data.id,
        quantity: 1,
        sku: vm.data.id,
        name: vm.data.brand + ' ' + vm.data.shortname + ' ' + vm.data.productype,
        shortname: vm.data.shortname,
        brand: vm.data.brand,
        department: vm.data.department,
        producttype: vm.data.productype,
        type_id: 'style',
        category: vm.data.productype
      };
    }

    /**
     * @ngdoc function
     * @name getProductInfoForTracking
     * @description get tracking data for a associated config product
     */
    function getProductInfoForTracking(productId) {
      var product = lodash.find(vm.data.products, { id: productId });
      return {
        product_id: product.id,
        quantity: 1,
        sku: product.id,
        name: product.brand + ' ' + product.shortname  + ' ' + product.productype + ' ' + product.color,
        shortname: product.shortname,
        color: product.color,
        brand: product.brand,
        department: product.department,
        price: product.price,
        producttype: product.productype,
        type_id: 'configurable',
        size: 'x',
        category: product.productype
      };
    }
  }
  /* jshint +W106 */
  /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
})();
