(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('ReviewsController', ReviewsController);

  ReviewsController.$inject = ['api', 'head'];

  function ReviewsController(api, head) {

    var vm = this;
    vm.head = head;

    api.getReviews().then(function (data) {
      vm.data = data;
    });

    vm.sendMyReview = function() {
      delete vm.myReview.tempRating;
      api.reviewAdd(vm.myReview);
    };
  }

})();
