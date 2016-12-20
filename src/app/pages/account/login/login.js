(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('LoginController', LoginController);

  LoginController.$inject = ['api', '$stateParams','$location',
    'gettext', 'toastr', 'segment'];

  function LoginController(api, $stateParams, $location,
      gettext, toastr, segment) {
    var vm = this;
    vm.phonenumber = '';
    vm.showPinInput = false;
    vm.error = {};

    vm.validatePin = validatePin;
    vm.validatePhone = validatePhone;

    activate();

    ////////////

    function activate() {
      setRedirect();
      clearErrors();
    }

    function setRedirect() {
      if ($stateParams.redirect && $stateParams.redirect.length > 0) {
        vm.redirectTo = $stateParams.redirect;
      } else {
        //default redirect
        vm.redirectTo = '/';
      }
    }

    function validatePhone(data) {
      if (data && data.toString().length > 7) {
        switchInputs(true);
        api.sendPin(data, 'orderListing')
        .then(function(data) {
          clearErrors();
        }, function (reason) {
          vm.error.sendPinError = true;
        });
      } else {
        vm.error.phonenumber = true;
        var message = gettext('The phone number seems wrong, can you double check it?');
        toastr.warning(message);
      }
    }

    function validatePin(data) {
      if (typeof data === 'undefined') {
        return;
      }

      var pincode = data.toString();
      if (pincode.length === 4) {
        vm.error.pincode = false;

        api.checkPin(pincode, vm.phonenumber, 'orderListing')
        .then(function(data) {
          if (data.valid) {
            $location.url(vm.redirectTo).search({pin: pincode, phonenumber: vm.phonenumber});
            segment.track(segment.events.LOGIN_SUCCESS);
          } else {
            vm.error.pincode = true;
            var message = gettext('The pin you inserted does not match what we have in our records');
            toastr.warning(message);
            segment.track(segment.events.LOGIN_FAILED);
          }
        });
      } else {
        vm.error.pincode = true;
        var message = gettext('The pin you inserted does not match what we have in our records');
        toastr.warning(message);
        segment.track(segment.events.LOGIN_FAILED);
      }
    }

    function switchInputs(show) {
      if (typeof show !== 'undefined') {
        if (show) {
          vm.showPinInput = true;
        } else {
          vm.showPinInput = false;
        }
      } else {
        vm.showPinInput = !vm.showPinInput;
      }
    }

    function clearErrors() {
      vm.error.phonenumber = false;
      vm.error.sendPinError = false;
      vm.error.pincode = false;
    }

  }

})();
