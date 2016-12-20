(function() {
  'use strict';

  window.performanceMark = function (name) {
    if (!window.performance || !window.performance.mark) {
      console.log('performance.mark Not supported');
      return;
    }
    // Create the performance mark
    window.performance.mark(name);
  };

  window.performanceMeasure = function (name, start, end) {
    if (!window.performance || !window.performance.measure) {
      console.log('performance.measure Not supported');
      return;
    }
    // Create the performance measurement
    window.performance.measure(name, start, end);
  };

  window.printPerformanceInfo = function() {
      var pageLoadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
      console.info('User-perceived page loading time: ' + pageLoadTime / 1000);
      console.table(performance.getEntriesByType('measure'));
      console.table(performance.getEntriesByType('mark'));
    };

}());
