(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .directive('rsSpinner', rsSpinner);

  function rsSpinner() {
    var directive = {
      templateUrl: 'app/components/ui/spinner/spinner.html',
      restrict: 'E'
    };

    return directive;
  }

}());
