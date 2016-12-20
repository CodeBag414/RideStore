/* global Auth0Lock */
(function () {
  'use strict';

  angular
    .module('RidestoreApp.admin')
    .component('adminDashboard', {
      templateUrl: 'app/components/admin/dashboard/admin-dashboard.html',
      controller: AdminDashboardController,
    });

  AdminDashboardController.$inject = ['$state', '$timeout','adminAuthenticationService', 'rsConfig'];

  function AdminDashboardController($state, $timeout, adminAuthenticationService, rsConfig) {
    var $ctrl = this;
    var lock = new Auth0Lock(rsConfig.auth0.userId, rsConfig.auth0.domain, {});

    $ctrl.isAdmin = adminAuthenticationService.isAdmin;
    $ctrl.login = login;
    $ctrl.logout = logout;
    $ctrl.go = $state.go;
    $ctrl.getProfileName = adminAuthenticationService.getProfileName;
    $ctrl.getProfilePicture = adminAuthenticationService.getProfilePicture;

    ////////////////

    $ctrl.$onInit = activate();
    $ctrl.$onChanges = function(changesObj) { };
    $ctrl.$onDestroy = function() { };

    ////////////////

    function activate() {
      console.log('running auth0');

      lock.on('authenticated', setAuthenticationCredentials);

      $timeout(loadLoginPage, 1000); //prevent login page to show when we have not yet checked for login credentials
    }

    ////////////////

    function login() {
      if (!lock) {
        lock = new Auth0Lock(rsConfig.auth0.userId, rsConfig.auth0.domain, {});
      }
      lock.show();
    }

    function logout() {
      adminAuthenticationService.logout();
    }

    function loadLoginPage() {
      if (!adminAuthenticationService.isAdmin()) {
        lock.show();
      }
    }

    function setAuthenticationCredentials(authResult) {
      lock.getProfile(authResult.idToken, function (error, profile) {
        if (error) {
          // Handle error
          return;
        }

        adminAuthenticationService.setAuthenticationCredentials(authResult, profile);

        adminAuthenticationService.loadFiles();
      });
    }

  }

})();
