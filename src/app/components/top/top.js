(function () {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('topController', topController);

  topController.$inject = ['head', 'topFactory', '$scope', '$state', 'mobileAppFactory',
    '$rootScope', '$timeout', '$window', 'cart','locale','localeConfig','$location'];

  function topController(head, topFactory, $scope, $state, mobileAppFactory,
    $rootScope, $timeout, $window, cart, locale, localeConfig, $location) {

    window.performanceMark('topController:start');

    /* jshint validthis: true */
    var vm = this;
    vm.settings = topFactory;
    vm.goDark = '0';
    vm.head = head;
    vm.cart = cart.getCart();
    vm.toggleSearchInput = toggleSearchInput;
    vm.searchInputVisible = false;
    vm.searchInputValue = '';
    vm.broadcastChangeOnInput = broadcastChangeOnInput;
    vm.submitSearch = submitSearch;
    vm.clearSearch = clearSearch;
    vm.locale = locale.getLocale();
    vm.stores = localeConfig.stores;
    vm.returnToShopping = returnToShopping;
    vm.back = back;
    vm.redirect = redirect;

    activate();

    //////////////

    function activate() {
      //listen to broadcast event on search input
      $scope.$on('search:search-input-value', function (event, args) {
        vm.searchInputValue = args.searchQuery;
        vm.searchInputVisible = true; //expands the input box
      });
      //check if screen is wide enough to expand the search
      if (head.getDevice() === 'desktop') {
        topFactory.setSearchSticky(true);
      }

      removePreferredStoreParameter();
    }

    function returnToShopping() {
      $state.go('home');
    }

    function back() {
      window.history.back();
    }

    function toggleSearchInput() {
      var status = topFactory.toggleSearch();
      if (status === true) {
        $timeout(function () { document.querySelector('#search-input').focus(); }, 0);
      }
    }

    function clearSearch() {
      vm.searchInputValue = '';
      broadcastChangeOnInput();
    }

    function broadcastChangeOnInput() {
      if ($state.current.name !== 'search') {
        $state.go('search', {q:vm.searchInputValue});
      } else {
        $state.transitionTo('search', {q:vm.searchInputValue}, { notify: false });
      }
      $rootScope.$broadcast('top:search-input-has-changed', {searchQuery: vm.searchInputValue});
    }

    function submitSearch() {
      document.getElementById('search-input').blur();
      broadcastChangeOnInput();
    }

    function redirect(tld) {
      setCookie('preferred-store', tld, 365); //setting it for the next 365d
      window.location = $location.protocol() + '://www.ridestore.' + tld + '?ps=' + tld;
    }

    function removePreferredStoreParameter() {
      $timeout(function() {
        if ($location.search().ps) {
          $location.search('ps', null).replace();
        }
      }, 2000);
    }

    angular.element($window).bind('scroll', onTopScroll);

    function onTopScroll() {
      var scroll = document.body.scrollTop;
      var elem = null;

      if (topFactory.getState().minimal) {
        //using a specific for minimal as the #header brings plenty of css attached
        elem = document.getElementById('minimal-header');
      } else {
        elem = document.getElementById('header');
      }

      if (elem !== null) {
        if (scroll > 40) {
          vm.goDark = '1';
          $scope.$digest();
        } else {
          vm.goDark = '0';
          $scope.$digest();
        }
      }
    }

    function setCookie(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
      var expires = 'expires=' + d.toUTCString();
      document.cookie = cname + '=' + cvalue + '; ' + expires;
    }

    window.performanceMark('topController:end');

    window.performanceMeasure('topController', 'topController:start', 'topController:end');

  }

})();
