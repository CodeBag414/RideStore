(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('MenuController', MenuController);

  MenuController.$inject = ['$scope', '$http', 'topFactory', 'api', 'head',
  'menuFactory', 'locale', 'storageService', '$state', 'lodash', 'rsConfig'];

  function MenuController($scope, $http, topFactory, api, head,
    menuFactory, locale, storageService, $state, lodash, rsConfig) {

    window.performanceMark('MenuController:start');

    var vm = this;

    vm.head = head;

    vm.activeOffset = 0;

    vm.isTablet = head.isTablet();
    vm.isAndroid = head.isAndroid();

    vm.top = topFactory;
    vm.note = 'Moto';
    vm.activeNav = false;
    vm.toggleActiveNav = toggleActiveNav;

    vm.setActiveGender = setActiveGender;
    vm.openCategory = openCategory;

    vm.back = function() {
      window.history.back();
    };

    setActiveGender();

    //temp fix for filter between snowboard/snowmobile under snow category
    vm.hideSection = 928; //928 = snowmobile section.

    //close the menu on state change
    $scope.$on('$stateChangeStart', function () {
      topFactory.setMenuStatus(false);
      vm.activeDropdown = 0;
    });

    function setActiveGender(gender) {
      if (!gender) {
        var defaultGender = 'men';
        vm.activeGender = storageService.get('gender') || defaultGender;
      }
      else {
        vm.activeGender = gender;
        storageService.set('gender', gender);
      }
      getMenu(vm.activeGender);
    }

    function getMenu(gender) {
      window.performanceMark('MenuController:getMenu:start');

      menuFactory.getData()
      .then(function(data) {
        vm.menuJson = data;
        if (gender !== 'men') {
          getMenuExtrasByGender(gender);
        }

        window.performanceMark('MenuController:getMenu:end');
        window.performanceMeasure('MenuController:getMenu',
          'MenuController:getMenu:start', 'MenuController:getMenu:end');
      });
    }

    function toggleActiveNav(ev) {
      var selector = '.no-close-on-swipe';
      if (!closest(ev.target, selector)) {
        vm.activeNav = false;
      }
    }

    // function extracted from http://stackoverflow.com/a/24107550/1740488
    function closest(el, selector) {
      var matchesFn;

      // find vendor prefix
      ['matches','webkitMatchesSelector','mozMatchesSelector','msMatchesSelector','oMatchesSelector']
      .some(function(fn) {
        if (typeof document.body[fn] === 'function') {
          matchesFn = fn;
          return true;
        }
        return false;
      });

      var parent;

      // traverse parents
      while (el) {
        parent = el.parentElement;
        if (parent && parent[matchesFn](selector)) {
          return parent;
        }
        el = parent;
      }

      window.performanceMark('Menu:closest:end');
      window.performanceMeasure('Menu:closest', 'Menu:closest:start', 'Menu:closest:end');

      return null;
    }

    function getMenuExtrasByGender(gender) {
      window.performanceMark('MenuController:getMenuExtrasByGender:start');

      //todo this is a temp api endpoint
      var params = {};
      params.callback = 'JSON_CALLBACK';
      var url = 'https://www.ridestore.se/test2/api2/girls_menu.php?lang=' + locale.getStore().lang;
      $http({
        method: 'JSONP',
        cache: true,
        url: url,
        params: params,
      }).then(function(res) {
        //todo fix this hack
        //replace street menu
        vm.menuJson[0] = res.data[0];
        //replace snow menu
        vm.menuJson[2] = res.data[1];

        window.performanceMark('MenuController:getMenuExtrasByGender:end');

        window.performanceMeasure(
          'MenuController:getMenuExtrasByGender',
          'MenuController:getMenuExtrasByGender:start',
          'MenuController:getMenuExtrasByGender:end');
      });
    }

    function openCategory(category) {
      if (isGiftcard(category.id)) {
        $state.go('giftcard');
      }
      else {
        $state.go('category', {id: category.id, url: category.url});
      }
    }

    function isGiftcard(categoryId) {
      if (lodash.indexOf(rsConfig.giftcard.categories, categoryId) > -1) {
        return true;
      }
      return false;
    }

    window.performanceMark('MenuController:end');

    window.performanceMeasure('MenuController', 'MenuController:start', 'MenuController:end');

  }

})();
