(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('CheckoutController', CheckoutController);

  CheckoutController.$inject = ['$location', '$sce', '$scope', '$state', '$timeout', '$window',
    'cart', 'checkout', 'head', 'locale', 'mobileAppFactory', 'segment', 'topFactory',
    'checkoutRemoveGuaranteesExperiment'];

  function CheckoutController($location, $sce, $scope, $state, $timeout, $window,
    cart, checkout, head, locale, mobileAppFactory, segment, topFactory,
    checkoutRemoveGuaranteesExperiment) {
    /* jshint -W106 */
    /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
    var vm = this;

    vm.currency = locale.getStore().currency;
    vm.checkoutService = checkout;
    vm.head = head;
    vm.top = topFactory;

    vm.discounts = [];
    vm.discountPin = '';
    vm.discountCode = '';
    vm.discountMessage = '';
    vm.showDiscountForm = false;
    vm.showPinValidation = false;
    vm.discountError = false;

    vm.toggleDiscountForm = toggleDiscountForm;
    vm.validateDiscount = validateDiscount;
    vm.addDiscount = addDiscount;
    vm.removeDiscount = removeDiscount;

    activate();

    ////////////

    function activate() {
      //activate experiment
      if (checkoutRemoveGuaranteesExperiment &&
        typeof checkoutRemoveGuaranteesExperiment.variation !== 'undefined') {

        vm.removeGuaranteesExperiment = checkoutRemoveGuaranteesExperiment.variation === 1 ? true : false;
      }

      //temp fix for app cart url
      if ($location.search().id && $location.search().appnew) {
        cart.reInitCart($location.search().id);
      }

      vm.checkoutCart = cart.getCart();
      if (vm.checkoutCart.cartId) {
        if (cart.isAllProductsInStock()) {
          vm.allProductsInStock = true;
          updateCheckout();
        } else {
          vm.allProductsInStock = false;
        }
      } else {
        //no active cart
        //check the url for a set checkout-id
        if ($location.search().id) {
          vm.checkoutCart.cartId = $location.search().id;
          updateCheckout();
        } else {
          vm.noItems = true;
        }
      }

      $scope.$on('cart:cartUpdated', function (event, args) {
        if ($state.current.name !== 'checkout-success') {
          if (cart.isAllProductsInStock()) {
            vm.allProductsInStock = true;
            updateCheckout();
          } else {
            vm.allProductsInStock = false;
          }
        }
      });

      //send app event if we are in mobile app
      if (mobileAppFactory.getStatus()) {
        mobileAppFactory.callUrlWithIframe('ridestore:ready');
      }
    }

    function toggleDiscountForm() {
      vm.showDiscountForm = !vm.showDiscountForm;
    }

    function addDiscount() {
      suspend();
      if (vm.discountCode.length > 0 && vm.checkoutCart.cartId) {
        checkout.addDiscount(vm.checkoutCart.cartId, vm.discountCode)
          .then(function (res) {
            resume();
            var data = res.data;
            if (data['is_valid']) {
              vm.discountError = false;
              vm.discounts = data.discounts;
              vm.discountMessage = data.message;
              toggleDiscountForm();
              clearDiscountInputForms();
              updateCartTotals();
            } else {
              if (data['pin_validation']) {
                vm.discountError = false;
                vm.discountMessage = data.message;
                vm.showPinValidation = true;
              } else {
                vm.discountError = true;
                vm.discountMessage = data.message;
              }
            }
          });
      }
    }

    function validateDiscount() {
      suspend();
      checkout.validateDiscount(vm.checkoutCart.cartId, vm.discountCode, vm.discountPin)
        .then(function (res) {
          resume();
          var data = res.data;

          if (data['is_valid']) {
            vm.discountError = false;
            vm.discounts = data.discounts;
            vm.discountMessage = data.message;
            vm.showPinValidation = false;
            toggleDiscountForm();
            clearDiscountInputForms();
            updateCartTotals();
          } else {
            vm.discountError = true;
            vm.discountMessage = data.message;
          }
        });
    }

    function removeDiscount(discountCode) {
      suspend();
      checkout.removeDiscount(vm.checkoutCart.cartId, discountCode)
        .then(function (res) {
          resume();
          var data = res.data;

          vm.discounts = data.discounts;
          updateCartTotals();
        });
    }

    ////////////

    function getSnippet() {
      var baseUrl = head.getBaseUrl();

      var successUrl = baseUrl + '/checkout/success';
      var failUrl = baseUrl + '/checkout'; //checkout url

      checkout.getSnippet(vm.checkoutCart.cartId, successUrl, failUrl)
        .then(function(res) {

          redirectIfNotOnRightState(res.data.state);

          //check state
          if (res.data.state === 'checkout') {
            //get discounts
            getActiveDiscounts();
            //refresh cart (if any promo items has been added)
            cart.refreshCart();
            //segment tracking
            trackView();
          } else if (res.data.state === 'confirmation') {
            if (res.data.orderId) {
              vm.orderId = res.data.orderId;
            }
            //track the order and clear the cart.
            trackSuccess(res.data.tracking);
            //add the checkout id to the url before cleaning the cart
            $location.skipReload().search({id: vm.checkoutCart.cartId});
            cart.clearCart();
          }

          if (res.data.paymentMethods && typeof res.data.preferredMethodIndex !== 'undefined') {
            vm.paymentMethods = res.data.paymentMethods;
            vm.selectedPaymentTab = res.data.preferredMethodIndex;

            for (var i = 0; i < vm.paymentMethods.length; i++) {
              vm.paymentMethods[i] = parsePaymentMethod(vm.paymentMethods[i]);
            }

            vm.ready = true;
            initKlarnaListener();
          }

          //if no payment method returned we are in success?
          //TODO: clarify this
          if (!res.data.paymentMethods && !res.data.paymentMethod) {
            vm.paymentMethod = 'checkmo';
            vm.orderId = res.data.orderId;
            vm.ready = true;
          }

          if (res.data.shippingMethods && res.data.currentShippingId) {
            vm.shippingMethods = res.data.shippingMethods;
            vm.currentShippingId = res.data.currentShippingId;
          }
        });
    }

    /**
     * @ngdoc function
     * @name redirectIfNotOnRightState
     * @description
     * redirects if the state is not the one we are currently in
     */
    function redirectIfNotOnRightState(state) {
      if (head.getTopLevelDomain() === 'com') {
        //we don't redirect on .com as this controller is loaded on cart
        //TODO refactor this, remove the usage of checkout controller on cart
        return;
      }

      if (state === 'checkout' &&
          $state.current.name !== 'checkout') {

        $state.go('checkout');
      } else if (state === 'confirmation' &&
          $state.current.name !== 'checkout-success') {

        $state.go('checkout-success');
      }
    }

    function updateCartTotals() {
      checkout.updateCartTotals(vm.checkoutCart.cartId);
    }

    /**
     * @ngdoc function
     * @name parsePaymentMethod
     * @description
     * validates both the redirectUrl and html attributes of the paymentMethod
     */
    function parsePaymentMethod(paymentMethod) {
      if (paymentMethod.html) {
        var checkoutHtml = paymentMethod.html.replace('text/javascript', 'text/javascript-lazy');
        paymentMethod.validHtml = $sce.trustAsHtml(checkoutHtml);
      }
      if (paymentMethod.redirectUrl) {
        paymentMethod.validRedirectUrl = $sce.trustAsResourceUrl(paymentMethod.redirectUrl);
      }

      return paymentMethod;
    }

    function clearDiscountInputForms() {
      vm.discountPin = '';
      vm.discountCode = '';

      $timeout(function() {
        vm.discountMessage = '';
      }, 5000); //clear message after 5s

    }

    function getActiveDiscounts() {
      checkout.getActiveDiscounts(vm.checkoutCart.cartId)
        .then(function(res) {
          vm.discounts = res.data.discounts;
        });
    }

    function updateCheckout() {
      clearDiscountInputForms();
      getSnippet();
    }

    function suspend() {
      if (window._klarnaCheckout) {
        window._klarnaCheckout(function (api) {
          api.suspend();
        });
      }
    }

    function resume() {
      if (window._klarnaCheckout) {
        window._klarnaCheckout(function (api) {
          api.resume();
        });
      }
    }

    function initKlarnaListener() {
      //register listener on change so we can cath user data
      //can only be setup when klarna has loaded. so we retry until its registered.
      if (window._klarnaCheckout) {
        window._klarnaCheckout(function(api) {
          api.on({
            'change': function(data) {
              identify(data);
            }
          });
        });
      }
      else {
        setTimeout(function() {
          initKlarnaListener();
        }, 250);
      }
    }

    function identify(data) {
      if (data.email) {
        trackEnteredAddress(data.email);
        segment.identify({
          web: true,
          app: false,
          email: data.email,
          firstName: data.given_name,
          lastName: data.family_name
        });
      }
    }

    function trackView() {
      var products = extractProductIds(vm.checkoutCart.products);
      segment.track(segment.events.CHECKOUT_STARTED, {
        cart_id: vm.checkoutCart.cartId,
        products: products,
        total: vm.checkoutCart.totalSum
      });
    }

    function trackEnteredAddress(email) {
      segment.track(segment.events.CHECKOUT_ENTERED_ADDRESS, {
        customerEmail: email,
      });
    }

    function trackSuccess(trackingData) {
      console.log(trackingData);
      segment.track(segment.events.ORDER_COMPLETED, trackingData);
      //send app event if we are in mobile app
      if (mobileAppFactory.getStatus()) {
        mobileAppFactory.callUrlWithIframe('ridestorecart:' + encodeURIComponent(JSON.stringify(trackingData)));
      }
    }

    function extractProductIds(products) {
      var productIds = [];
      products.forEach(function(product) {
        productIds.push({product_id: product.config_id});
      });
      return productIds;
    }
  }
  /* jshint +W106 */
  /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */

})();
