(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .directive('phonenumber', phonenumber);

  phonenumber.$inject = ['lodash'];

  function phonenumber(lodash) {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
        ctrl.$validators.phonenumber = function(modelValue, viewValue) {
          if (ctrl.$isEmpty(modelValue)) {
            return false;
          }
          var newValue = modelValue.replace('-','').replace(' ','');
          newValue = lodash.trimStart(newValue, '+');
          newValue = lodash.trimStart(newValue, '0');
          if (!lodash.startsWith(newValue,'46')) {
            newValue = '46' + newValue;
          }
          return newValue.length === 11;
        };
      }
    };
  }

})();
