(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('OrdersController', OrdersController);

  OrdersController.$inject = ['rsConfig','api', '$stateParams','$location'];

  function OrdersController(rsConfig, api, $stateParams, $location) {
    var vm = this;
    vm.status = '';
    if ($stateParams.phonenumber && $stateParams.phonenumber.length > 0) {
      api.allOrders({pin: $stateParams.pin, phonenumber: $stateParams.phonenumber}).then(function (data) {
        vm.list = data.orders;
      });
    } else {
      $location.url('/login').search({redirect: '/orders'});
    }
  }
})();
