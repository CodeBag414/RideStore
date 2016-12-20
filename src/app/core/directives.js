'use strict';

/**
* @ngdoc overview
* @name RidestoreApp
* @description
* # RidestoreApp
*
* Directives
*/

//ngrepeat finished event.
angular
.module('RidestoreApp')
.directive('onFinishRender', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    link: function(scope, element, attr) {
      if (scope.$last === true) {
        $timeout(function() {
          scope.$emit('ngRepeatFinished');
        });
      }
    }
  };
}]);

//preventdefault for a links with href, so we can set a href for SEO purposes.
angular
.module('RidestoreApp')
.directive('a', function() {
  return {
    restrict: 'E',
    link: function(scope, elem, attrs) {
      if (attrs.ngClick || attrs.href === '' || attrs.href === '#') {
        elem.on('click', function(e) {
          e.preventDefault();
        });
      }
    }
  };
});

angular
.module('RidestoreApp')
.directive('animateOnChange', ['$timeout', function($timeout) {
  return function(scope, element, attr) {
    scope.$watch(attr.animateOnChange, function(nv,ov) {
      if (nv !== ov) {
        element.addClass('changed');
        $timeout(function() {
          element.removeClass('changed');
        }, 1000); // Could be enhanced to take duration as a parameter
      }
    });
  };
}]);

angular
.module('RidestoreApp')
.directive('rsEnter', function () {
  return function (scope, element, attrs) {
    element.bind('keydown keypress', function (event) {
      if (event.which === 13) {
        scope.$apply(function () {
          scope.$eval(attrs.rsEnter);
        });
        event.preventDefault();
      }
    });
  };
});

angular
.module('RidestoreApp')
.directive('script', function() {
  return {
    restrict: 'E',
    scope: false,
    link: function(scope, elem, attr) {
      //It is eval that shood be used
      /* jshint -W054 */
      if (attr.type === 'text/javascript-lazy') {
        var code = elem.text();
        var f = new Function(code);
        f();
      }
      /* jshint +W054 */
    }
  };
});

angular
.module('RidestoreApp')
.directive('compile', ['$compile', function ($compile) {
  return function(scope, element, attrs) {
    scope.$watch(
      function(scope) {
        // watch the 'compile' expression for changes
        return scope.$eval(attrs.compile);
      },
      function(value) {
        // when the 'compile' expression changes
        // assign it into the current DOM
        element.html(value);
        // compile the new DOM and link it to the current
        // scope.
        // NOTE: we only compile .childNodes so that
        // we don't get into infinite loop compiling ourselves
        $compile(element.contents())(scope);
      }
    );
  };
}]);

/**
 * @ngdoc directive
 * @name selectOnClick
 * @description extracted from this SO answer: http://stackoverflow.com/a/14996261/1740488
 */
angular
.module('RidestoreApp')
.directive('selectOnClick', ['$window', function ($window) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.on('click', function () {
        if (!$window.getSelection().toString()) {
          // Required for mobile Safari
          this.setSelectionRange(0, this.value.length);
        }
      });
    }
  };
}]);

/**
 * @ngdoc directive
 * @name focusOn
 * @description triggers focus on the element when the attribute value changes and is truthy
 * extracted and adapted from this SO answer: http://stackoverflow.com/a/29783345/1740488
 * @example <input focus-on="{{expression}}"></input>
 */
angular
.module('RidestoreApp')
.directive('focusOn', ['$timeout', function($timeout) {
  return {
    restrict: 'A',
    compile: function() {
      var directiveName = this.name;

      return function(scope, elem, attrs) {
        attrs.$observe(directiveName, function(value) {
          if (value) {
            $timeout(function() {
              elem[0].focus();
            });
          }
        });
      };
    }
  };
}]);

angular
.module('RidestoreApp')
.directive('jsonld', ['$filter', '$sce', function($filter, $sce) {
  return {
    restrict: 'E',
    template: function() {
      return '<script type="application/ld+json" ng-bind-html="onGetJson()"></script>';
    },
    scope: {
      json: '=json'
    },
    link: function(scope, element, attrs) {
      scope.onGetJson = function() {
        return $sce.trustAsHtml($filter('json')(scope.json));
      };
    },
    replace: true
  };
}]);

angular
.module('RidestoreApp')
.directive('imageonload', function() {
  return {
    restrict: 'A',
    link: function(scope, element, attrs) {
      element.bind('load', function() {
        //call the function that was passed
        scope.$apply(attrs.imageonload);
      });
    }
  };
});
