(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('GiftcardController', GiftcardController);

  GiftcardController.$inject = ['gettext', 'giftcard', 'head', 'locale', 'topFactory',
    '$rootScope', '$scope', '$state', '$stateParams', '$timeout', '$uibModal'];

  function GiftcardController(gettext, giftcard, head, locale, topFactory,
      $rootScope, $scope, $state, $stateParams, $timeout, $uibModal) {
    var vm = this;

    vm.head = head;
    vm.top = topFactory;

    vm.amountMin = locale.getStore().giftcard.amount.min;
    vm.amountStep = locale.getStore().giftcard.amount.step;
    vm.currency = locale.getStore().currency;

    vm.isVirtualSelected = isVirtualSelected;
    vm.isPhysicalSelected = isPhysicalSelected;

    vm.submit = submit;

    vm.showFront = true;
    vm.errorAddingToCart = '';
    vm.warning = false;
    vm.cartIsLoading = false;

    vm.flipButtonCallback = flipButtonCallback;

    activate();

    ////////////

    function activate() {
      triggerCardAnimationWhenReady();

      if (isGiftcardCheckoutSuccess()) {
        vm.cartId = $stateParams.cartId;
        openSuccessModal();
        resetCard();
      }

      vm.card = {
        amount: '',
        method: giftcard.defaultMethod,
        senderName: '',
        senderEmail: '',
        recipientName: '',
        recipientEmail: '',
      };

      $timeout(function () {
        vm.deregisterformMethodWatcher = $scope
          .$watch('giftcardForm.method.$modelValue', methodHasChanged);
      }, 1000); //timeout to avoid listening changes while the form is being built
    }
    ////////////

    function submit(validCard) {
      if (!validCard) {
        showWarning();
        return;
      }

      giftcard.setCard(vm.card);

      if (giftcard.isPhysical()) {
        clearErrorMessages();
        addGiftcardToCart();
      }

      if (giftcard.isVirtual()) {
        clearErrorMessages();
        doInstantCheckout();
      }
    }

    ////////////

    /**
     * @ngdoc function
     * @name addGiftcardToCart
     * @description
     *  for physical cards only, these are added as a regular product in the cart
     */
    function addGiftcardToCart() {
      vm.cartIsLoading = true;
      giftcard.addToCart().then(function(res) {
        vm.cartIsLoading = false;
        if (res.status === 'success') {
          showSuccessAddingToCart();
          resetCard();
        } else {
          showErrorAddingToCart();
        }
      }, function(reason) {
        vm.cartIsLoading = false;
        showSuccessAddingToCart(); //we want the user to do checkout
        showErrorAddingToCart(reason);
      });
    }

    /**
     * @ngdoc function
     * @name doInstantCheckout
     * @description
     *  for virtual cards only, we perform an instant klarna checkout
     */
    function doInstantCheckout() {
      giftcard.instantCheckout().then(function(res) {
        if (res.status === 'success') {
          openInstantCheckout(res.cartId);
        } else {
          showErrorAddingToCart();
        }
      });

    }

    /**
     * @ngdoc function
     * @name openInstantCheckout
     * @description
     *  opens a klarna checkout modal
     */
    function openInstantCheckout(cartId) {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/pages/instant-checkout/instant-checkout-modal/instant-checkout-modal.html',
        controller: 'InstantCheckoutModalController',
        controllerAs: 'ICModalController',

        resolve: {
          cartId: function() {
            return cartId;
          },
          checkoutStage: function() {
            return 'checkout';
          }
        },
      });

      modalInstance.result.then(function (returnedValue) {
        // on modal success: do nothing
      }, function () {
        // on modal dismiss: do nothing
      });
    }

    /**
     * @ngdoc function
     * @name openSuccessModal
     * @description
     *  opens a klarna success modal
     */
    function openSuccessModal() {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/pages/instant-checkout/instant-checkout-modal/instant-checkout-modal.html',
        controller: 'InstantCheckoutModalController',
        controllerAs: 'ICModalController',

        resolve: {
          cartId: function() {
            return vm.cartId;
          },
          checkoutStage: function() {
            return 'success';
          }
        },
      });

      modalInstance.result.then(function (returnedValue) {
        // on modal success
        $state.go('giftcard');
      }, function () {
        // on modal dismiss
        $state.go('giftcard');
      });
    }

    function isVirtualSelected() {
      return vm.card.method === giftcard.methods.virtual.name;
    }

    function isPhysicalSelected() {
      return vm.card.method === giftcard.methods.physical.name;
    }

    /**
     * @ngdoc function
     * @name flipButtonCallback
     * @description sets the flipButton object once the flipButton is ready
     */
    function flipButtonCallback(flipButton) {
      vm.flipButton = flipButton;
    }

    function showSuccessAddingToCart() {
      vm.showFront = false;
      if (vm.flipButton) {
        vm.flipButton.showBack();
      }
    }

    function showWarning() {
      vm.warning = true;
    }

    function hideWarning() {
      vm.warning = false;
    }

    function showErrorAddingToCart(message) {
      if (!message) {
        vm.errorAddingToCart = gettext('Something happened when adding to cart, try again.');
      } else {
        vm.errorAddingToCart = message;
      }
    }

    function hideErrorAddingToCart() {
      vm.errorAddingToCart = '';
    }

    function clearErrorMessages() {
      hideWarning();
      hideErrorAddingToCart();
    }

    function isGiftcardCheckoutSuccess() {
      if ($stateParams.cartId) {
        return true;
      }
      return false;
    }

    function resetCard() {
      $scope.giftcardForm.$setPristine();
      $scope.giftcardForm.$setUntouched();

      vm.card = {
        amount: '',
        method: giftcard.defaultMethod,
        senderName: '',
        senderEmail: '',
        recipientName: '',
        recipientEmail: '',
      };
    }

    function methodHasChanged(method) {
      if (method === giftcard.methods.virtual.name) {
        // if we are in virtual giftcard, we only have the front button
        vm.showFront = true;
        if (vm.flipButton) {
          vm.flipButton.showFront();
        }
      }
      //if we had error messages, they should be cleaned
      clearErrorMessages();
    }

    function triggerCardAnimationWhenReady() {
      vm.deregisterViewContentLoaded = $rootScope.$on('$viewContentLoaded', function(event) {
        vm.viewContentLoaded = true;
        if (vm.giftcardImageReady) {
          vm.ready = true;
        }
      });

      $scope.giftcardReady = function() {
        vm.giftcardImageReady = true;

        if (vm.viewContentLoaded) {
          vm.ready = true;
        }
      };
    }

    $scope.$on('$destroy', function() {
      vm.deregisterformMethodWatcher();
      vm.deregisterViewContentLoaded();
    });

  }

}());
