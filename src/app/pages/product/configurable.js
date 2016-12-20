/**
* Configurable product
*
* Ridestore AB
*/
(function() {

  'use strict';

  angular
  .module('RidestoreApp')
  .controller('ProductController', ProductController);

  ProductController.$inject = ['$location', '$rootScope', '$sce', '$scope', '$stateParams', 'gettextCatalog', '$q',
    'api', 'blazyService', 'cart', 'head', 'lodash', 'rsConfig', 'segment', '$timeout', 'topFactory', '$uibModal',
    'tracking', 'locale', 'shoeSizeConverterService', 'adminAuthenticationService'];

  /* jshint -W071 */ // Ignore too many statements. bug ridestore-angular RIDANG1-153
  /* jshint -W072 */ // There are too many params passed to ProductController, all are used,
  // these are a code smell, but for now decision is to disable the warnings, TODO: refactor
  function ProductController ($location, $rootScope, $sce, $scope, $stateParams, gettextCatalog, $q,
    api, blazyService, cart, head, lodash, rsConfig, segment, $timeout, topFactory, $uibModal,
    tracking, locale, shoeSizeConverterService, adminAuthenticationService) {
    /* jshint -W106 */
    /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */

    window.performanceMark('ProductController:start');

    var vm = this;

    vm.head = head;
    vm.shoeSizeConverterService = shoeSizeConverterService;
    vm.getSizingDefaultUnit = getSizingDefaultUnit;
    vm.isAdminLoaded = adminAuthenticationService.isAdminLoaded;

    vm.top = topFactory;
    vm.mediaPath = rsConfig.mediaPath;
    vm.dpr = window.devicePixelRatio;
    vm.imageHeight = Math.round(window.innerWidth * 1.1765873015873);
    vm.windowWidth = window.innerWidth;

    vm.openSizeGuide = openSizeGuide;
    vm.openColorsModal = openColorsModal;

    vm.data = {};

    vm.isOneSize = isOneSize;
    vm.flipButtonCallback = flipButtonCallback;
    vm.showFront = true;
    vm.cartIsLoading = false;

    var isDesktop = false;
    if (head.getDevice() === 'desktop') {
      isDesktop = true;
    }

    vm.toggleSize = toggleSize;
    vm.setSize = setSize;

    vm.galleryLength = 0;
    vm.galleryGroupActive = 0;
    vm.showColorsButton = true;
    var galleryIsUpdating = false;
    var galleryElement;
    var galleryGroupWidth;

    vm.openTab = '';
    vm.toggleTab = function(data) {
      if (vm.openTab === data) {
        vm.openTab = '';
      } else {
        vm.openTab = data;
      }
    };

    vm.outofstock = false;

    vm.isProductOutOfStock = isProductOutOfStock;
    function isProductOutOfStock() {
      if (!vm.data || !vm.data.sizes) {
        return;
      }
      var sizes = vm.data.sizes;

      for (var i = 0; i < sizes.length; i++) {
        if (sizes[i]['is_in_stock'] !== 0) {
          return false;
        }
      }
      return true;
    }

    function setSize(size) {
      hideWarningNoSizeAdded();

      vm.chosenSize = size.id;
      if (size.is_in_stock === 0) {
        vm.outofstock = true;
      } else {
        vm.outofstock = false;
      }
    }

    function toggleSize(size) {
      if (vm.chosenSize !== size.id) {
        setSize(size);
        vm.showFront = true;
        if (vm.flipButton) {
          vm.flipButton.showFront(); //if setting size, then I want to add to cart
        }
      } else {
        delete vm.chosenSize;
        if (vm.outofstock) {
          vm.outofstock = false;
        }
      }

    }

    setUrl(); //using $stateParams

    vm.outofstockNotice = function(configId, simpleId, email) {
      if (isOneSize()) {
        vm.setSize(vm.data.sizes[0]);
        simpleId = vm.chosenSize;
      }

      if (!simpleId) {
        showWarningNoSizeAdded();
        return;
      }

      var emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      if (emailRegex.test(email)) {
        vm.errorInEmail = false;
        vm.flipButtonOutOfStock.showBack();
        api.outofstockNotice(configId, simpleId, email);
      } else {
        vm.errorInEmail = true;
      }
    };

    vm.addToCart = function(configId, simpleId) {
      window.performanceMark('AddingProductToCart:start');

      if (isOneSize()) {
        vm.setSize(vm.data.sizes[0]);
        simpleId = vm.chosenSize;
      }

      if (!simpleId) {
        showWarningNoSizeAdded();
      } else {
        clearErrorMessages();
        vm.cartIsLoading = true;
        cart.addToCart(configId, simpleId)
          .then(function(res) {
            vm.cartIsLoading = false;
            if (res.status === 'success') {
              showSuccessAddingToCart();
              resetSelections();
              trackAddToCart(res.cartId, simpleId);
            } else {
              showErrorAddingToCart(status);
            }
            window.performanceMark('AddingProductToCart:end');
            window.performanceMeasure('AddingProductToCart', 'AddingProductToCart:start', 'AddingProductToCart:end');
          });
      }
    };

    /**
     * @ngdoc function
     * @name flipButtonCallback
     * @description sets the flipButton object once the flipButton is ready
     */
    function flipButtonCallback(flipButton) {
      vm.flipButton = flipButton;
    }

    vm.flipButtonOutOfStockCallback = function(flipButton) {
      vm.flipButtonOutOfStock = flipButton;
    };

    function showSuccessAddingToCart() {
      console.log('show success');
      vm.showFront = false;
      if (vm.flipButton) {
        vm.flipButton.showBack();
      }
    }

    function showWarningNoSizeAdded() {
      vm.noSizeAdded = true;
      console.warn('choose a size you fucker');
    }

    function hideWarningNoSizeAdded() {
      vm.noSizeAdded = false;
    }

    function showErrorAddingToCart(status) {
      vm.errorAddingToCart = true;
      console.warn('show error message. could not be added . sry /bye', status);
    }

    function hideErrorAddingToCart() {
      vm.errorAddingToCart = false;
    }

    function clearErrorMessages() {
      hideWarningNoSizeAdded();
      hideErrorAddingToCart();
    }

    function resetSelections() {
      delete vm.chosenSize;
    }

    vm.getSizeRatingPercentage = function(size_rating) {
      switch (size_rating) {
        case 1: return 10;
        case 3: return 50;
        case 5: return 100;
      }
    };

    vm.getSizeRatingTranslate = function(size_rating) {
      switch (size_rating) {
        case 1: return gettextCatalog.getString('Small');
        case 3: return gettextCatalog.getString('Just right');
        case 5: return gettextCatalog.getString('Large');
      }

    };

    getData();

    function getData() {
      window.performanceMark('ProductController:getData:start');

      if ($stateParams.id) {
        var endpointUrl = 'products/' + $stateParams.id;

        api.performJsonpRequest(endpointUrl)
        .then(function(res) {
          window.performanceMark('ProductController:getData:response');
          vm.data = res.data;
          //html vars needs to be sanitized
          if (typeof vm.data.desc === 'string') {
            vm.data.desc = $sce.trustAsHtml(vm.data.desc);
          }
          if (typeof vm.data.sizeguide === 'string') {
            vm.data.sizeguide = $sce.trustAsHtml(vm.data.sizeguide);
          }

          //set head meta tags
          head.setTitle(vm.data.meta.title);
          head.setDescription(vm.data.meta.description);
          head.setAppRoute('product', $stateParams.id);
          head.setImage(rsConfig.imgix.domain + 'catalog/product/' + vm.data.image);
          head.setProductSchema(getStructuredData());
          head.setAMPUrl(rsConfig.amp.baseUrl + vm.data.weblink);

          setUrl(vm.data.weblink);

          //created grouped gallery for desktop
          vm.data.gallery_grouped = convertToRowsOf2(vm.data.gallery);
          //find eventual sizeinfo attribute
          var modelinfo_attribute = lodash.find(vm.data.desc_attributes, function(obj) {
            return obj.attribute_code.indexOf('model') > -1;
          });
          if (typeof modelinfo_attribute !== 'undefined') {
            vm.modelinfo = modelinfo_attribute.value;
          }
          $timeout(function() {
            initGallery();
          });

          populateSizeData(vm.data);

          trackView();
          tracking.page(vm.data.meta.title);

          window.performanceMark('ProductController:getData:end');
          window.performanceMeasure(
            'ProductController:getData:postResponse',
            'ProductController:getData:response',
            'ProductController:getData:end');
          window.performanceMeasure(
            'ProductController:getData',
            'ProductController:getData:start',
            'ProductController:getData:end');
        }, function(reason) {
          var message = gettextCatalog.getString('Error loading product.');
          api.displayErrorToast(message, reason);
          return $q.reject(reason);
        });
      }
    }

    function populateSizeData(data) {
      var shoesCategoryId = rsConfig.sizeConversionTables.shoes.categoryId;
      var productCategoryId = data['main_category'].id + '';
      var brandId = data['brand_details']['category_id'];

      if (shoesCategoryId !== productCategoryId) {
        return; //if no shoes, there's no business to be done here
      }

      shoeSizeConverterService.getBrandConversionTable(brandId)
      .then(function(response) {
        if (!response || !vm.data) {
          return;
        }

        vm.canShowSizesInEur = true;

        vm.data.sizes.forEach(function(currentValue, index, arr) {
          var sizeInEur = shoeSizeConverterService.getSizeValueInEUR(brandId, currentValue['size_value']);
          if (sizeInEur) {
            currentValue.sizeInEur = sizeInEur;
          }
        });

        return response;
      });
    }

    function getSizingDefaultUnit() {
      if (!vm.data || !vm.data['brand_details']) {
        return;
      }

      var brandId = vm.data['brand_details']['category_id'];

      return shoeSizeConverterService.getBrandSizingDefaultUnit(brandId);
    }

    /**
     * @ngdoc function
     * @name setUrl
     * @description set the url manually from a given url in case
     *    the url is not set yet, or from $stateParams
     *
     * @param {String} [url=undefined] if url is passed, then attempts to set the url
     *
     */
    function setUrl(url) {
      if (url) {
        if ($location.url() === '/') { //if it has not already been set
          $location.url('/' + url);
        }
      } else {
        if ($stateParams.url) {
          $location.url($stateParams.url);
        }
      }
    }

    function trackView() {
      segment.track(segment.events.PRODUCT_VIEWED, getProductInfoForTracking());
    }

    function trackAddToCart(cartId, size) {
      var productCartData = getProductInfoForTracking();
      productCartData.cart_id = cartId;
      productCartData.size = size;
      segment.track(segment.events.PRODUCT_ADDED, productCartData);
    }

    function getProductInfoForTracking() {
      var price = vm.data.sale_price || vm.data.price;
      return {
        product_id: vm.data.id,
        quantity: 1,
        sku: vm.data.sku,
        name: vm.data.brand + ' ' + vm.data.shortname + ' ' + vm.data.productype + ' ' + vm.data.color,
        shortname: vm.data.shortname,
        brand: vm.data.brand,
        department: vm.data.department,
        producttype: vm.data.productype,
        type_id: 'configurable',
        price: price,
        currency: locale.getStore().currencyCode,
        category: vm.data.productype
      };
    }

    function convertToRowsOf2(list) {
      var newList = [];
      var row;
      for (var i = 0; i < list.length; i++) {
        if (i % 2 === 0) {
          row = [];
          newList.push(row);
        }
        row.push(list[i]);
      }
      return newList;
    }

    function isOneSize() {
      if (vm.data && vm.data.sizes) {
        return vm.data.sizes.length === 1 && vm.data.sizes[0].size_value === 'One Size';
      }
      return false;
    }

    // Gallery stuff below. TODO, move to directive
    //////////////////////

    function initGallery() {
      //set gallery length
      vm.galleryLength = lodash.range(0,vm.data.gallery.length);
      if (vm.data.related_style.length > 0 && head.getDevice() === 'mobile') {
        vm.galleryLength.push('style');
      }

      //get gallery element
      galleryElement = document.getElementById('maingallery');
      if (!isDesktop) {
        //bind scroll event
        angular.element(galleryElement).bind('scroll', galleryScrollMobile);
      }
      else {
        //get width of image group
        galleryGroupWidth = galleryElement.getElementsByClassName('image-group')[0].offsetWidth;
        //bind scroll event
        angular.element(galleryElement).bind('scroll', galleryScrollDesktop);
      }
    }

    function galleryScrollMobile() {
      //set position element to active when reached
      var position = Math.round(galleryElement.scrollLeft / vm.windowWidth);
      if (position !== vm.galleryGroupActive) {
        vm.galleryGroupActive = position;
        if (position > 0) {
          vm.showColorsButton = false;
        }
        else {
          vm.showColorsButton = true;
        }
        $scope.$apply();
      }
    }

    function galleryScrollDesktop() {
      var position = Math.round(galleryElement.scrollLeft / galleryGroupWidth);
      if (position !== vm.galleryGroupActive) {
        vm.galleryGroupActive = position;
        $scope.$apply();
        scrollThumbs();
      }
    }

    //set gallery position from thumbnails
    vm.setGalleryPosition = function(index) {
      if (index > -1 && index <= vm.data.gallery_grouped.length - 1 && !galleryIsUpdating) {
        galleryIsUpdating = true;
        vm.galleryGroupActive = index;
        var imageWidth = galleryGroupWidth;
        var position = imageWidth * index;
        //if the group only have 1 image, then scroll half length
        if (vm.data.gallery_grouped[index].length < 2) {
          position = position - (imageWidth / 2);
        }
        animatedScroll(galleryElement, position, 300);
      }
    };

    function scrollThumbs() {
      //scroll thumb to the right position
      var thumbnails = document.getElementById('thumbnails');
      var activeThumbnail = thumbnails.getElementsByClassName('active');
      thumbnails.scrollTop = activeThumbnail[0].getBoundingClientRect().height * vm.galleryGroupActive;
    }

    function animatedScroll(element, position, scrollDuration) {
      var distance = position - element.scrollLeft;
      var scrollStep = distance / (scrollDuration / 15);
      var scrollInterval = setInterval(function() {
        if (element.scrollLeft !== position) {
          if (position - element.scrollLeft <= 15) {
            element.scrollLeft = position;
          }
          else {
            element.scrollLeft += scrollStep;
          }
        }
        else {
          clearInterval(scrollInterval);
          scrollThumbs();
          galleryIsUpdating = false;
        }
      },15);
    }

    function openSizeGuide(size) {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/pages/product/sizeguide/sizeguide.html',
        controller: 'SizeGuideController',
        controllerAs: 'vm',
        size: size,

        resolve: {
          content: function() {
            return vm.data.sizeguide.content;
          },
          showOk: function () {
            return true;
          }
        },
      });

      modalInstance.result.then(function (returnedValue) {
        console.info('Modal success at: ' + new Date(), returnedValue);
      }, function () {
        console.info('Modal dismissed at: ' + new Date());
      });
    }

    function openColorsModal(size) {
      var modalInstance = $uibModal.open({
        templateUrl: 'app/pages/product/colors-modal/colors-modal.html',
        controller: 'ColorsModalController',
        controllerAs: 'vm',
        size: size,

        resolve: {
          colors: function() {
            return vm.data['more_colors'];
          },
          showOk: function () {
            return true;
          }
        },
      });

      modalInstance.rendered.then(function (returnedValue) {
        blazyService.revalidate();
      });

      modalInstance.result.then(function (returnedValue) {
        console.info('Modal success at: ' + new Date(), returnedValue);
      }, function () {
        console.info('Modal dismissed at: ' + new Date());
      });
    }

    function getStructuredData() {
      var price = vm.data.sale_price || vm.data.price;
      var data = {
        '@context': 'http://schema.org/',
        '@type': 'Product',
        'name': vm.data.brand + ' ' + vm.data.shortname + ' ' + vm.data.productype + ' ' + vm.data.color,
        'image': rsConfig.imgix.domain + 'catalog/product/' + vm.data.image,
        'sku': vm.data.sku,
        'brand': {
          '@type': 'Thing',
          'name': vm.data.brand
        },
        'offers': {
          '@type': 'Offer',
          'priceCurrency': locale.getStore().currencyCode,
          'price': price,
          'itemCondition': 'http://schema.org/NewCondition',
          'availability': 'http://schema.org/InStock',
          'seller': {
            '@type': 'Organization',
            'name': 'Ridestore'
          }
        }
      };
      if (vm.data.review_count) {
        data.aggregateRating = {
          '@type': 'AggregateRating',
          'ratingValue': vm.data.review_score,
          'reviewCount': vm.data.review_count
        };
      }
      return data;
    }

    $scope.$on('$destroy', function() {
      angular.element(galleryElement).unbind('scroll', galleryScrollMobile);
      angular.element(galleryElement).unbind('scroll', galleryScrollDesktop);
      //reset json-ld
      head.setProductSchema('');
    });
    /* jshint +W106 */
    /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */

    window.performanceMark('ProductController:end');

    window.performanceMeasure('ProductController', 'ProductController:start', 'ProductController:end');
  }

})();
