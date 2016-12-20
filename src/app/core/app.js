'use strict';

/**
* @ngdoc overview
* @name RidestoreApp
* @description
* # RidestoreApp
*
* Main module of the application.
*/
/* global FastClick */
var app = angular.module('RidestoreApp', [
  'ngRaven',
  'ui.router',
  'ngStorage',
  'ngSanitize',
  'ngTouch',
  'ngAnimate',
  'LocalStorageModule',
  'ngCookies',
  'ngLodash',
  'contentful',
  'hc.marked',
  'ngSegment',
  'smoothScroll',
  'gettext',
  'angularLoad',
  'yaru22.angular-timeago',
  'ngProgress',
  'ui.bootstrap',
  'toastr',
  'oc.lazyLoad'
]);

app.config(['$provide', '$ocLazyLoadProvider', '$sceDelegateProvider', 'rsConfig',
function($provide, $ocLazyLoadProvider, $sceDelegateProvider, rsConfig) {

  $sceDelegateProvider.resourceUrlWhitelist([
     // Allow same origin resource loads.
     'self',
     // Allow loading from our assets domain.  Notice the difference between * and **.
     rsConfig.stylecreatorApiBaseUrl + '*',
     rsConfig.stylecreatorAdminApiBaseUrl + '*'
   ]);

  $ocLazyLoadProvider.config({
    'debug': true
  });

  $provide.decorator('$location', locationDecorator);

  locationDecorator.$inject = ['$delegate', '$rootScope'];

  //provides a set location.url method without changing the route.
  // from https://github.com/angular-ui/ui-router/issues/427#issuecomment-130230116
  function locationDecorator($delegate, $rootScope) {
    var skipping = false;

    $rootScope.$on('$locationChangeSuccess', function(event) {
      if (skipping) {
        event.preventDefault();
        skipping = false;
      }
    });

    $delegate.skipReload = function() {
      skipping = true;
      return this;
    };

    return $delegate;
  }
}]);

app.run(['locale', 'segmentLoader', 'segment', 'mobileAppFactory', 'head',
  function(locale, segmentLoader, segment, mobileAppFactory, head) {
  locale.setLocale();
  FastClick.attach(document.body);

  //check if the request is from the mobile app
  mobileAppFactory.checkIsApp();

  if (!head.isPrerender()) {
    //load segment integrations after 1 second, if its not a prerender request
    segmentLoader.load(segment.config.apiKey, 1000);
  }

}]);
