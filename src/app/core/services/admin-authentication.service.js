(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('adminAuthenticationService', adminAuthenticationService);

  adminAuthenticationService.$inject = ['$ocLazyLoad', '$sce', 'storageService'];

  function adminAuthenticationService($ocLazyLoad, $sce, storageService) {
    var _filesLoaded = false;

    return {
      isAdmin: isAdmin,
      loadFiles: loadFiles,
      filesLoaded: filesLoaded,
      isAdminLoaded: isAdminLoaded,
      getAdminToken: getAdminToken,
      getAdminTokenPayload: getAdminTokenPayload,
      getAdminProfile: getAdminProfile,
      setAuthenticationCredentials: setAuthenticationCredentials,
      logout: logout,
      getProfileName: getProfileName,
      getProfilePicture: getProfilePicture,
    };

    ////////////

    function loadFiles() {
      if (!_filesLoaded) {
        return $ocLazyLoad.load(['/webadmin.app.js','/webadmin.app.css']).then(function() {
          _filesLoaded = true;
        });
      }
    }

    //////////// Getters

    function isAdmin() {
      if (getAdminTokenPayload()) {
        var adminTokenPayload = getAdminTokenPayload();
        var now = new Date();
        if ((now.getTime() / 1000) < adminTokenPayload.exp) {
          return true;
        }
      }
      return false;
    }

    function filesLoaded() {
      return _filesLoaded;
    }

    function isAdminLoaded() {
      return filesLoaded() && isAdmin();
    }

    function getAdminToken() {
      return storageService.get('adminToken');
    }

    function getAdminTokenPayload() {
      return storageService.get('adminTokenPayload') ?
        JSON.parse(storageService.get('adminTokenPayload')) :
        null;
    }

    function getAdminProfile() {
      return storageService.get('adminProfile') ?
        JSON.parse(storageService.get('adminProfile')) :
        null;
    }

    function getProfileName() {
      return getAdminProfile()['given_name'];
    }

    function getProfilePicture() {
      return $sce.trustAsHtml(getAdminProfile()['picture']);
    }

    //////////// Setters

    function setAuthenticationCredentials(authResult, profile) {
      storageService.set('adminToken', authResult.idToken);
      storageService.set('adminTokenPayload', JSON.stringify(authResult.idTokenPayload));
      storageService.set('adminProfile', JSON.stringify(profile));
    }

    function logout() {
      storageService.remove('adminToken');
      storageService.remove('adminTokenPayload');
      storageService.remove('adminProfile');
    }

  }

}());
