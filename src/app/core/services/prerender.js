(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('prerenderService', prerenderService);

  prerenderService.$inject = ['$window', '$timeout', 'head'];

  function prerenderService($window, $timeout, head) {
    var preRenderTimeout;

    return {
      cancelFinishedRendering: cancelFinishedRendering,
      finishedRendering: finishedRendering,
    };

    function finishedRendering(callback) {
      if (head.isPrerender()) {
        cancelFinishedRendering();

        if (callback) {
          $timeout(callback);
        }

        preRenderTimeout = $timeout(function () {
          console.info('prerender Ready');
          $window.prerenderReady = true;
        });
      }
    }

    function cancelFinishedRendering() {
      if (preRenderTimeout) {
        return $timeout.cancel(preRenderTimeout);
      }
      return false;
    }
  }
})();
