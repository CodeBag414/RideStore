/* global Dropzone */
(function () {
  'use strict';
  angular
    .module('RidestoreApp.admin', [['/webadmin.vndr.js', '/webadmin.vndr.css']])
    .config(config);

  function config() {
    setDropzoneConfig(0);

    //////////

    function setDropzoneConfig(attempts) {
      attempts++;

      if (window.Dropzone) {
        Dropzone.autoDiscover = false;
      } else {
        if (attempts < 50) { //we try a maximum of 50 times (5s)
          setTimeout(function() { setDropzoneConfig(attempts); }, 100); //try again later
        }
      }
    }
  }
})();
