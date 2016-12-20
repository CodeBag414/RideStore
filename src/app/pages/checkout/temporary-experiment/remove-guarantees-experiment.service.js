(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('checkoutRemoveGuaranteesExperiment', checkoutRemoveGuaranteesExperiment);

  checkoutRemoveGuaranteesExperiment.$inject = ['$injector', '$window', 'lodash', 'rsConfig'];

  function checkoutRemoveGuaranteesExperiment($injector, $window, lodash, rsConfig) {

    var service = {
      initialize: initialize
    };

    return service;

    ////////////

    function initialize() {
      if (!$window.experiments) {
        return;
      }

      var experiment = rsConfig.analyticsExperiments.checkoutRemoveGuarantees;

      if (!lodash.find($window.experiments, ['id', experiment.id])) {
        //not assigned to this experiment
        return;
      }

      var analyticsExperimentsService = $injector.get('analyticsExperimentsService');

      return analyticsExperimentsService.setupExperiment(experiment.id)
        .then(function(experiment) { return experiment; });
    }

  }

}());
