(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('FooterController', FooterController);

  FooterController.$inject = ['footerFactory', '$sce','locale','$http','api'];

  function FooterController(footerFactory, $sce, locale, $http, api) {

    window.performanceMark('FooterController:start');

    var vm = this;

    vm.locale = locale.getLocale();

    vm.addEmail = function(email) {
      api.subscribeEmailList({email:email}).then(function(data) {
        vm.emailAdded = true;
      });
    };

    vm.settings = footerFactory;

    window.performanceMark('FooterController:end');

    window.performanceMeasure('FooterController', 'FooterController:start', 'FooterController:end');

  }
})();
