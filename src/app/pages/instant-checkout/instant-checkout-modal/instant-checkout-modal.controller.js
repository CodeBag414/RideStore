(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('InstantCheckoutModalController', InstantCheckoutModalController);

  InstantCheckoutModalController.$inject = ['cartId', 'checkout', 'checkoutStage', 'segment',
    '$sce', '$state', '$uibModalInstance'];

  function InstantCheckoutModalController(cartId, checkout, checkoutStage, segment,
    $sce, $state, $uibModalInstance) {

    var vm = this;

    vm.cancel = cancel;
    vm.close = close;
    vm.cartId = cartId;
    vm.checkoutStage = checkoutStage;

    activate();

    function activate() {
      if (checkoutStage === 'success') {
        vm.showCancelButton = false;
        vm.showCloseButton = true;
      } else {
        vm.showCancelButton = true;
        vm.showCloseButton = false;
      }

      getCheckoutSnippet();
    }

    function getCheckoutSnippet() {
      var successUrl = $state.href('instant-checkout-success', { cartId: vm.cartId}, {absolute: true});

      checkout.getSnippet(vm.cartId, successUrl)
        .then(function(res) {
          //replace script tag with lazy script directive to run the script after its inserted
          var checkoutHtml = res.data.html.replace('text/javascript', 'text/javascript-lazy');
          vm.paymentMethod = 'klarnacheckout';
          vm.checkoutSnippet = $sce.trustAsHtml(checkoutHtml);
          vm.ready = true;
          initKlarnaListener();
        });
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
        segment.identify({
          web: true,
          app: false,
          email: data.email,
          firstName: data['given_name'],
          lastName: data['family_name']
        });
      }
    }

    function close() {
      $uibModalInstance.dismiss('close');
    }

    function cancel() {
      $uibModalInstance.dismiss('cancel');
    }

  }
}());
