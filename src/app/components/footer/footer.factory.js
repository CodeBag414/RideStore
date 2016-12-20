(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('footerFactory', footerFactory);

  var seoText = '';
  var isVisible = true;

  function footerFactory() {

    return {
      setSeoText: setSeoText,
      getSeoText: getSeoText,
      getVisibility: getVisibility,
      setVisibility: setVisibility
    };
    function getVisibility() {
      return isVisible;
    }
    function setVisibility(status) {
      isVisible = status;
    }
    function setSeoText(newText, h1) {
      //check if the text contains a h1, otherwise add a h1 if provided
      if (typeof h1 !== 'undefined' && newText.indexOf('<h1>') === -1) {
        newText = '<h1>' + h1 + '</h1>' + newText;
      }
      seoText = newText;
    }

    function getSeoText() {
      return seoText;
    }

  }
})();
