/**
* Blazy service
*
* Ridestore AB
*/

/* global Blazy */
(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('blazyService', blazyService);

  blazyService.$inject = ['head', 'prerenderService', 'rsConfig', '$timeout', '$window'];

  function blazyService(head, prerenderService, rsConfig, $timeout, $window) {
    var blazyParams = rsConfig.blazyParams;
    var blazyDisabled = false;

    var loadStarted = false;

    var blazy = createBlazy();

    var service = {
      destroy: destroy,
      load: load,
      revalidate: revalidate,
      createBlazy: createBlazy,
      removeFixedSize: removeFixedSize,
    };

    return service;

    ////////////

    function destroy() {
      return $window.blazy.destroy();
    }

    function load(elem, force) {
      if (head.isPrerender()) {
        return noLazyLoad();
      }

      if ($window.blazy && $window.blazy.load) {
        return $window.blazy.load(elem, force);
      } else {
        console.error('Blazy was not loaded properly');
      }
    }

    function revalidate() {
      if (head.isPrerender()) {
        return noLazyLoad();
      }

      return $timeout(function () {
        if ($window.blazy && $window.blazy.revalidate) {
          prerenderService.finishedRendering(loadAllElements);

          return $window.blazy.revalidate();
        } else {
          console.error('Blazy was not loaded properly');
        }
      });
    }

    function removeFixedSize() {
      var nodes = document.querySelectorAll('.b-lazy');
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].style.width = '';
      }
    }

    ////////////

    function createBlazy() {
      if (head.isPrerender()) {
        return noLazyLoad();
      }

      if (typeof Blazy !== 'undefined') {
        return $timeout(function () {
          //console.log('creating blazy');
          $window.blazy = new Blazy({
            container: blazyParams.container,
            offset: blazyParams.offset,
            selector: blazyParams.selector,
            src: blazyParams.src,
            successClass: blazyParams.successClass,
            success: function(ele) {
              // Image has loaded
              prerenderService.finishedRendering();
            },
            error: function(ele, msg) {
              /* jshint -W035 */
              if (msg === 'missing') {
                // Data-src is missing
                //console.warn('blazyError', ele, msg);
              }
              else if (msg === 'invalid') {
                // Data-src is invalid
                console.warn('blazyError', ele, msg);
              }
            }
          });
        });
      } else {
        console.error('Blazy was not loaded properly');
        return;
      }
    }

    /**
     * @ngdoc function
     * @name loadAllElements
     * @description
     *  this function force loads all the elements in the dom with .b-lazy
     *  WARNING: don't use this lightly, it was meant for sprerenderService.
     */
    function loadAllElements() {
      if (head.isPrerender()) {
        return noLazyLoad();
      }

      if (!loadStarted) { //we don't want multiple calls to load
        loadStarted = true;
        prerenderService.cancelFinishedRendering();
        $timeout(function() {
          var elms = document.querySelectorAll(blazyParams.selector);
          for (var i = 0; i < elms.length; i++) {
            if (elms[i] && !elms[i].classList.contains(blazyParams.successClass)) {
              load(elms[i], false);
            }
          }
          prerenderService.finishedRendering();
          loadStarted = false;
        });
      }
    }

    /**
     * @ngdoc function
     * @name noLazyLoad
     * @description
     *  resolves the <img src="">  without lazyloading
     *
     */
    function noLazyLoad() {
      blazyDisabled = true;

      if (!loadStarted) {
        loadStarted = true;

        $timeout(function() {
          var elms = document.querySelectorAll(blazyParams.selector);
          for (var i = 0; i < elms.length; i++) {
            if (elms[i] && !elms[i].classList.contains(blazyParams.successClass)) {
              resolveSrcUrl(elms[i]);
            }
          }
          prerenderService.finishedRendering();
          loadStarted = false;
        });
      }

    }

    function resolveSrcUrl(elem) {
      var ngElem = angular.element(elem);
      var src = getImgixUrl(ngElem.attr(blazyParams.src));

      ngElem.addClass(blazyParams.successClass);
      ngElem.attr('src', src);

      console.log('resolveUrl + elem' + elem, ngElem, src);
    }

    function getImgixUrl(src) {
      var host = '';
      var dataSrc = '';
      var source = '';

      //check if its a contentful image, if so replace the url
      if (isContentful(src)) {
        dataSrc = src.replace(rsConfig.imgix.contentfulReplace, '');
        host = rsConfig.imgix.contentfulDomain;
      } else {
        dataSrc = src;
        host = rsConfig.imgix.domain;
      }

      source = host + dataSrc + '?' + getBaseImgixParams();

      //check if its a png to descide what params to use
      if (isPNG(dataSrc)) {
        return source + '&format=png&strip=cs';
      } else {
        return source + '&' + getSharpenImgixParams() + '&auto=format';
      }
    }

    function isContentful(src) {
      return src.indexOf(rsConfig.imgix.contentfulReplace) > -1;
    }

    function isPNG(src) {
      return src.indexOf('.png') > -1;
    }

    function getBaseImgixParams() {
      return 'fit=' + rsConfig.imgix.baseParams.fit +
        '&' + 'q=' + rsConfig.imgix.baseParams.q +
        '&' + 'dpr=' + $window.devicePixelRatio;
    }

    function getSharpenImgixParams() {
      return 'usm=' + rsConfig.imgix.sharpenParams.usm +
        '&' + 'chromasub=' + rsConfig.imgix.sharpenParams.chromasub;
    }

  }

}());
