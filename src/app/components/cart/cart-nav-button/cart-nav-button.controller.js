(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('CartNavButtonController', CartNavButtonController);

  CartNavButtonController.$inject = ['cart', 'topFactory', '$scope'];

  function CartNavButtonController(cart, topFactory, $scope) {

    var vm = this;

    activate();

    ////////////

    function activate() {
      vm.cartItemsCount = cart.getCartItemsCount();
      vm.top = topFactory;
      vm.device = $scope.vm.device;

      // need to use a watcher as the device is not updated automagically within
      $scope.$watch('vm.device', function() {
        vm.device = $scope.vm.device;
      });

      //listen to broadcast event on update of cart
      $scope.$on('cart:cartUpdated', function (event, args) {
        vm.cartItemsCount = args.cart.items;
      });

    }

  }}());
