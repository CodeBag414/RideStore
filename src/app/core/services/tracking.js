/**
* Ridestore tracking service
*
* Ridestore AB
*/
(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('tracking', tracking);

  tracking.$inject = ['$state', 'segment'];

  function tracking($state, segment) {

    var referrer = '';
    //check if there is a referrer
    if (document.referrer) {
      referrer = document.referrer;
    }

    return {
      page: page,
    };

    ////////////

    function page(title) {
      segment.page({
        name: $state.current.name,
        title: title,
        referrer : referrer
      });
      //reset referrer so we dont track it on next page also.
      referrer = '';
    }

  }

})();
