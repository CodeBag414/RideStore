/**
* head controller
*
* Ridestore AB
*/
(function() {

  'use strict';

  angular
  .module('RidestoreApp')
  .controller('MainController', MainController);

  MainController.$inject = ['head', '$scope', '$rootScope', '$timeout', 'topFactory',
    '$state', '$window', 'tracking', 'footerFactory', 'mobileAppFactory',
    '$sessionStorage', 'lodash', 'blazyService', 'ngProgressFactory', 'prerenderService',
    'wishAndCartMigrationService','adminAuthenticationService'];

  /* jshint -W072 */ //too many parameters
  function MainController (head, $scope, $rootScope, $timeout, topFactory,
    $state, $window, tracking, footerFactory, mobileAppFactory,
    $sessionStorage, lodash, blazyService, ngProgressFactory, prerenderService,
    wishAndCartMigrationService,adminAuthenticationService) {

    var vm = this;
    vm.head = head;

    $rootScope.$state = $state;
    vm.state = $state;
    vm.top = topFactory;
    vm.mobileApp = mobileAppFactory;

    $sessionStorage.stateHistory = {};

    //progress bar
    vm.progressbar = ngProgressFactory.createInstance();
    vm.progressbar.setColor('#4bbe53');

    //set device depending on window
    var device = head.setDevice($window.innerWidth);
    angular.element($window).bind('resize', updateDevice);

    //Admin loading
    if (adminAuthenticationService.isAdmin()) {
      adminAuthenticationService.loadFiles();
    }

    $scope.$on('ngRepeatFinished', function(ngRepeatFinishedEvent) {
      $timeout(blazyService.revalidate);
    });

    $rootScope.$on('$stateChangeStart',
      function(event, toState, toParams, fromState, fromParams) {
        vm.progressbar.reset();
        vm.progressbar.start();

        prerenderService.cancelFinishedRendering();
        //set response codes for prerender.io
        if (toParams.responseCode === 301) {
          vm.response = { code: 301, url: '/' + toParams.url };
        }
        else {
          vm.response = { code: 200, url: null };
        }
        //Store stateParams values in a sessionStorage object with {url -> {type,ids,url}}
        if (!lodash.isEmpty(fromParams)) {
          var history = {
            type: fromState.name,
            id: fromParams.id,
            url: fromParams.url,
          };

          if (fromState.name === 'category' && fromState.name !== toState.name) {
            if (fromParams.urlParams) {
              history.urlParams = fromParams.urlParams;
            }
          }

          $sessionStorage.stateHistory[fromParams.url] = history;
        }

      });

    //state change functions
    $rootScope.$on('$stateChangeSuccess',
    function(event, toState, toParams, fromState, fromParams) {
      //update active state name
      vm.activeState = toState.name;
      //set header param for design
      topFactory.setState(toState.header);
      //set title if not product or category
      if (toState.name !== 'category' && toState.name.indexOf('product') === -1) {
        head.setTitle('Ridestore - ' + toState.name);
        //track page change, on category and product we do this in their controller after we get required data
        tracking.page('Ridestore - ' + toState.name);
      }
      //reset footer text
      footerFactory.setSeoText('');
      //reset head image
      head.resetImage();
      //if mobile and state is product page and previous is category. add backbutton to header
      if (head.getDevice() === 'mobile' &&
      fromState.name === 'category' &&
      toState.name.indexOf('product') > -1) {
        topFactory.setState({backbutton: true});
      }

      document.body.scrollTop = document.documentElement.scrollTop = 0;

    });

    $rootScope.$on('$viewContentLoaded', function(event) {
      vm.progressbar.complete();
      prerenderService.finishedRendering();
    });

    function updateDevice() {
      var newDevice = head.setDevice($window.innerWidth);
      if (newDevice !== device) {
        $scope.$digest();
        device = newDevice;
      }
    }
  }
})();
