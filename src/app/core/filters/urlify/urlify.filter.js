(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .filter('urlify', function() {
    return function (input) {
      return input.toLowerCase()
      .replace(/å/gi, 'a')
      .replace(/ä/gi, 'a')
      .replace(/ö/gi, 'o')
      .replace(/\s/g, '-');
    };
  });
}());
