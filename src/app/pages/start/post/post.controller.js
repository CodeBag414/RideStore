(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('PostController', PostController);

  PostController.$inject = ['$scope', '$state', 'mobileAppFactory'];

  function PostController($scope, $state, mobileAppFactory) {

    var vm = this;
    vm.openLink = openLink;

    vm.post = $scope.$parent.item;

    var isMobileApp = mobileAppFactory.getStatus();

    function openLink(state, id) {
      if (isMobileApp) {
        mobileAppFactory.openAppLink(state, id);
      }
      else {
        $state.go(state, {'id': id});
      }
    }

  }}());
