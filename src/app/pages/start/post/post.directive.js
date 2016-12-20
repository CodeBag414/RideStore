(function() {
  'use strict';

  /**
  * @desc post item used in feeds
  * @example <rs-post post="post"></rs-post>
  */
  angular
  .module('RidestoreApp')
  .directive('rsPost', rsPost);

  function rsPost() {
    var directive = {
      templateUrl: 'app/pages/start/post/post.html',
      restrict: 'E',
      scope: {
        item: '<',
      },
      controller: 'PostController',
      controllerAs: 'vm',
      bindToController: true // because the scope is isolated
    };

    return directive;
  }

}());
