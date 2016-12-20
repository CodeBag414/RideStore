(function() {
  'use strict';

  /**
   * @ngdoc service
   * @name analyticsExperimentsService
   * @description
   *  used to interact with the Google Analytics Content Experiments interface
   *  expects the cxApi to have previously been loaded (currently using Google
   *  Tag Manager for it).
   */

  angular
    .module('RidestoreApp')
    .factory('analyticsExperimentsService', analyticsExperimentsService);

  analyticsExperimentsService.$inject = ['segment', '$q', '$timeout', '$window'];
  function analyticsExperimentsService(segment, $q, $timeout, $window) {
    var experiment = {
      id: '',
      variation: 0
    };

    var service = {
      getExperiment: getExperiment,
      setupExperiment: setupExperiment,
    };

    return service;

    ////////////////

    function getExperiment() {
      return experiment;
    }

    function setupExperiment(experimentId) {
      _setExperimentId(experimentId);
      _trackOnSegment();

      return _chooseVariation().then(function () {
        return getExperiment();
      });
    }

    //////////////// Private methods

    function _chooseVariation() {
      var deferred = $q.defer();

      $timeout(function() {
        if (!_isCxAPILoaded()) {
          deferred.reject('no cxApi loaded');
        } else {
          experiment.variation = $window.cxApi.chooseVariation();
          $window.cxApi.setChosenVariation(experiment.variation, experiment.id);
          deferred.resolve(experiment);
        }
      }, 100);

      return deferred.promise;
    }

    function _isCxAPILoaded() {
      return $window.cxApi ? true : false;
    }

    function _setExperimentId(id) {
      experiment.id = id;
    }

    function _trackOnSegment() {
      segment.track(segment.events.EXPERIMENT_VIEWED, {
        id: experiment.id,
        variation: experiment.variation
      });
    }
  }
})();
