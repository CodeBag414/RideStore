/**
* Configurable product
*
* Ridestore AB
*/
/* global google */
(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('StickersThanksController', StickersThanksController);

  StickersThanksController.$inject = ['$scope', 'topFactory', 'api', 'angularLoad'];

  function StickersThanksController ($scope, topFactory, api, angularLoad) {
    /* jshint -W106 */
    /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */

    var vm = this;
    var callback = 'JSON_CALLBACK';
    var autocomplete = '';

    topFactory.setState('transparent-white logo');
    var googleMapsKey = 'AIzaSyDOGaFQJLva4uGyTDm5aGc1qiF6r-b2bug';
    var googleMapsUrl = 'https://maps.googleapis.com/maps/api/js?v=3.exp&key=' + googleMapsKey + '&libraries=places';

    angularLoad.loadScript(googleMapsUrl).then(function() {
      // Script loaded succesfully.
      autocomplete = new google.maps.places.Autocomplete(
        /** @type {HTMLInputElement} */ (document.getElementById('autocomplete')), {
        types: ['address']
      });
      google.maps.event.addListener(autocomplete, 'place_changed', updateAdress);
    }).catch(function() {
      // There was some error loading the script. Meh
    });

    vm.popup = false;

    vm.formInfo = {};
    vm.formInfo.googleHit = false;
    var googleAutocompleteBox = document.getElementById('autocomplete');
    vm.send = function() {
      vm.waitForPaymentDone = true;
      api.postStickersOrder(vm.formInfo).then(function(res) {
        var timerId = setInterval(function () {
          api.checkStickersPayment(res.data.newOrderId).then(function(res2) {
            if (res2.data.paid) {
              vm.waitForPaymentDone = false;
              clearInterval(timerId);
            }
          });
        }, 1000);// 1/10 sek
      });
    };

    // When the user selects an address from the dropdown,
    // populate the address fields in the form.
    var componentForm = {
      street_number: 'short_name',
      route: 'long_name',
      locality: 'long_name',
      administrative_area_level_1: 'short_name',
      country: 'long_name',
      postal_code: 'short_name'
    };

    function updateAdress() {

      $scope.$apply(function() {

        vm.formInfo.postalNumber = '';
        vm.formInfo.city = '';
        vm.formInfo.street = '';

        var place = autocomplete.getPlace();
        for (var i = 0; i < place.address_components.length; i++) {
          var addressType = place.address_components[i].types[0];
          if (componentForm[addressType]) {
            vm.formInfo.googleHit = true;
            var val = place.address_components[i][componentForm[addressType]];

            if (addressType === 'postal_code') {
              vm.formInfo.postalNumber = val;
            }else if (addressType === 'locality') {
              vm.formInfo.city = val;
            }else if (addressType === 'route') {
              vm.formInfo.street = val + ' ' + vm.formInfo.street;
            }else if (addressType === 'street_number') {
              vm.formInfo.street = vm.formInfo.street + val;

            }
          }
        }
      });
    }
    /* jshint +W106 */
    /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
  }

})();
