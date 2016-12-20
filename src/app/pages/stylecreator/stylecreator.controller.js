(function() {
  'use strict';

  angular.module('RidestoreApp')
  .controller('StylecreatorCtrl', StylecreatorCtrl);

  StylecreatorCtrl.$inject = ['$scope', 'lodash', 'stylecreatorConfig', '$state',
    '$window', '$timeout', '$location', 'stylecreatorFactory', 'mobileAppFactory',
    '$stateParams', 'footerFactory', 'cart', 'segment', 'rsConfig', 'topFactory',
    'head', 'adminAuthenticationService', 'api', 'stylecreatorEditorService',
    'toastr'];
  /* jshint -W071 */ //too many statements
  /* jshint -W072 */ //too many parameters
  function StylecreatorCtrl ($scope, lodash, stylecreatorConfig, $state,
    $window, $timeout, $location, stylecreatorFactory, mobileAppFactory,
    $stateParams, footerFactory, cart, segment, rsConfig, topFactory,
    head, adminAuthenticationService, api, stylecreatorEditorService,
    toastr) {
    /* jshint -W106*/
    /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
    //TODO: convert snake_case to camelCase and remove jscs and jshint rules above
    var vm = this;

    var department = stylecreatorConfig.departments[$stateParams.department][0];
    vm.department = department;
    var browserWidth = window.innerWidth;
    var activeCategoryId = 0;

    //admin stuff
    vm.isAdminLoaded = adminAuthenticationService.isAdminLoaded;
    vm.isEditMode = stylecreatorEditorService.isEditMode;
    vm.saveStyleAsAdmin = saveStyleAsAdmin;

    vm.departments = stylecreatorConfig.departments;

    vm.style = stylecreatorConfig.style;

    vm.selectedProducts = [];
    vm.selectedFilters = {
      brands: [],
      sizes: []
    };
    vm.activeCategoryIndex = 1;
    vm.popupOpen = false;
    vm.filterStatus = false;
    vm.activeFilterSection = 'brands';
    vm.isChanged = false;
    vm.activeGender = 'men';

    //public functions
    vm.getSizes = getSizes;
    vm.setSize = setSize;
    vm.setCategory = setCategory;
    vm.setProduct = setProduct;
    vm.buyProducts = buyProducts;
    vm.save = save;
    vm.appAction = appAction;
    vm.head = head;
    vm.goToProduct = goToProduct;
    vm.setFilterStatus = setFilterStatus;
    vm.setActiveGender = setActiveGender;
    vm.status = 'ACCEPTED';

    vm.togglePopup = function() {
      vm.popupOpen = !vm.popupOpen;
    };

    vm.toggleFilter = function(event) {
      event.preventDefault();
      vm.filterStatus = !vm.filterStatus;
    };

    vm.resetFilter = function() {
      vm.selectedFilters = {
        brands: [],
        sizes: []
      };
      getProducts();
    };

    vm.setActiveFilterSection = function(filtername) {
      vm.activeFilterSection = filtername;
    };

    vm.setFilter = function(filter, filterOption) {
      vm.selectedFilters[filter] = stylecreatorFactory.toggleArrayItem(vm.selectedFilters[filter], filterOption);
      getProducts();
    };

    vm.changeDepartment = function(department) {
      $location.url('stylecreator/' + angular.lowercase(department[0].name));
    };

    //init
    vm.mobileApp = mobileAppFactory.getStatus();
    vm.isIOS = head.isIOS();

    setupSelectedProducts();
    setActiveGender(department.gender);
    getProducts();
    getSelectedProducts(department.id, vm.selectedProducts).then(function(data) {
      getStyleImage();
    });
    trackView();

    //functions

    function setupSelectedProducts() {
      if ($location.search().p) {
        vm.selectedProducts = $location.search().p.split(',').map(Number);
      } else {
        $location.url('stylecreator/' + angular.lowercase(department.name));
        vm.selectedProducts = department.defaultProducts ? department.defaultProducts : [];
      }
    }

    function setCategory(category) {
      activeCategoryId = category.id;
      vm.activeCategoryIndex = category.sort_order + 1;

      showCategoryTip();
      setVisableProducts();
      document.body.scrollTop = document.documentElement.scrollTop = 0;
    }

    function setFilterStatus(status) {
      vm.status = status;
      getProducts(true);
    }

    function setProduct(product, categoryId) {
      vm.isChanged = true;
      var indexOfProduct = vm.selectedProducts.indexOf(product.id);
      if (indexOfProduct >= 0) {
        //remove the product
        vm.selectedProducts.splice(indexOfProduct, 1);
        //check if parent product should be removed as well
        removeParentProduct(product.id, categoryId);
      }
      else {
        //check if we can add the product
        if (isCategoryRequirementsMet()) {
          addProduct(product.id, categoryId);
        }
      }
      //finally get a new style with the products
      getStyleImage();
      updatedStyle();
    }

    function addProduct(productId, categoryId) {
      //check if product with same category is already selected
      var productWithSameCategory = lodash.find(vm.styleData.products, function(obj) {
        return obj.category_id === categoryId;
      });
      if (typeof productWithSameCategory !== 'undefined') {
        //remove the old product
        removeProduct(productWithSameCategory.id);
      }
      //add the new
      vm.selectedProducts.push(productId);
    }

    function removeParentProduct(productId, categoryId) {
      var isParentProduct = stylecreatorConfig.rules.requiredProductCategories.indexOf(categoryId) > -1;
      if (isParentProduct) {
        //check if child exists
        var childProduct = lodash.find(vm.styleData.products, function(obj) {
          return stylecreatorConfig.rules.categories.indexOf(obj.category_id) > -1;
        });
        if (typeof childProduct !== 'undefined') {
          removeProduct(childProduct.id);
        }
      }
    }

    function removeProduct(productId) {
      var indexOfProduct = vm.selectedProducts.indexOf(productId);
      vm.selectedProducts.splice(indexOfProduct, 1);
    }

    function swapStyleImage(styleImages) {
      vm.styleImage =  styleImages;
      vm.fadeIn = false;
      $timeout(function () {
        vm.styleImageTwo = styleImages;
        vm.fadeIn = true;
      }, 400);
      //update og:image meta
      head.setImage(styleImages.front);
    }

    function getProducts(disableCache) {
      return stylecreatorFactory.getProductsData(department.id, vm.selectedFilters, vm.status, disableCache)
      .then(function(data) {
        vm.styleProducts = data.products;
        vm.filters = data.filters;
        activeCategoryId = data.products[0].id;
        setVisableProducts();
        footerFactory.setVisibility(false);
      });
    }

    function getStyleImage() {
      getSelectedProducts(department.id, vm.selectedProducts);
      var cacheBreaker = 0;
      if (vm.styleData) {
        vm.styleData.products.forEach(function(product) {
          cacheBreaker += product.caching ? product.caching : 0;
        });
      }

      var images = stylecreatorFactory.getImages(department.id, vm.selectedProducts, cacheBreaker);
      swapStyleImage(images);
      updateUrl();
      if (vm.selectedProducts.length > 0) {
        trackGenerated();
      }
    }

    function getSelectedProducts(departmentId, selectedProductIds) {
      return stylecreatorFactory.getSelectedProducts(departmentId, selectedProductIds)
      .then(function(res) {
        vm.styleData = res.data;
      });
    }

    function updateUrl() {
      if (vm.selectedProducts.length > 0) {
        $location.search('p', vm.selectedProducts.join());
      }
    }

    function showCategoryTip() {
      if (isCategoryRequirementsMet()) {
        vm.showNote = 0;
      } else {
        vm.showNote = 1;
      }
      vm.showBlockedNote = 0;
      if (isCategoryBlockedBySelection()) {
        vm.showBlockedNote = 1;
      }
    }

    function isCategoryRequirementsMet() {
      //check if we are in a category that has some rule
      if (stylecreatorConfig.rules.categories.indexOf(activeCategoryId) > -1) {
        //check if the required product is set
        var requiredProduct = lodash.find(vm.styleData.products, function(obj) {
          return stylecreatorConfig.rules.requiredProductCategories.indexOf(obj.category_id) > -1;
        });
        if (typeof requiredProduct === 'undefined') {
          return false;
        }
      }
      //check if current category is blocked by the products selected
      if (isCategoryBlockedBySelection()) {
        return false;
      }
      return true;
    }

    function isCategoryBlockedBySelection() {
      if ((activeCategoryId === 934 || activeCategoryId === 1013) &&
          lodash.find(vm.styleData.products, {producttype_id: 1451})) {
        return true;
      }
      return false;
    }

    function getSizes(product) {
      stylecreatorFactory.getSizes(product.id)
      .then(function(data) {
        product.sizes = data;
        vm.activeSizeSelectionProduct = product;
      });
    }

    function setSize(product, size) {
      size.selected = true;
      vm.activeSizeSelectionProduct = null;
      product.selectedSize = size;
      vm.cartSuccess = false;
    }

    function buyProducts() {
      var products = lodash.omitBy(vm.styleData.products, function(product) {
        return lodash.isNil(product.selectedSize);
      });

      if (cart.getCart().cartId) {
        addToCart(products);
      } else {
        //if we don't have a cartId, we initiate it
        cart.refreshCart().then(function(result) {
          addToCart(products);
        });
      }
    }

    function addToCart(products) {
      vm.cartError = false;
      Object.keys(products).forEach(function(key) {
        vm.successCounter = 0;
        vm.cartIsLoading = true;
        cart.addToCart(products[key].id, products[key].selectedSize.id)
        .then(function(res) {
          if (res.status === 'success') {
            vm.successCounter = vm.successCounter + 1;
          } else {
            vm.cartError = true;
            vm.cartIsLoading = false;
            $timeout(function() {vm.cartError = false; }, 3000);
          }
          if (vm.successCounter === Object.keys(products).length) {
            vm.cartSuccess = true;
            vm.cartIsLoading = false;
          }
        });
      });
    }

    function save() {
      if (vm.isFavorite) { //TODO: loop through favorites to confirm if favorite
        return;
      }

      stylecreatorFactory
      .saveToFavorites(vm.selectedProducts, department)
      .then(function (res) {
        vm.isFavorite = true;
      });
    }

    function saveStyleAsAdmin() {
      if (!adminAuthenticationService.isAdminLoaded() || vm.savingStyleAsAdmin) {
        return;
      }

      vm.savingStyleAsAdmin = true;

      //TODO: Change brand to dropdown.
      var brand = getSuggestedBrand(vm.styleData);

      stylecreatorEditorService.saveStyle(vm.styleImage, vm.selectedProducts, brand.id, department)
      .then(function(response) {
        vm.savingStyleAsAdmin = false;
        toastr.success('Success saving the style', response.data.sku);

        //NOTE: we use a quick hack for now for having the sku immediately selected in case they want to copy it.
        //Not the nicest interface, but works, should replace for modal when touching this again, or if someone
        //complains about it.
        $window.prompt('Success! You can copy the SKU to clipboard: Ctrl+C, Enter', response.data.sku);
      }, function(reason) {
        vm.savingStyleAsAdmin = false;
        toastr.error('Something failed when adding the style', reason);
      });
    }

    function getSuggestedBrand(styleData) {
      var priorities = stylecreatorConfig.namingRules.brand.priorities.ids;

      var brand = {
        id: vm.styleData.products[0]['brand_id'],
        name: vm.styleData.products[0].brand,
      };

      if (vm.styleData) {
        for (var i = 0; i < priorities.length; i++) {
          var product = lodash.find(vm.styleData.products, {'producttype_id': priorities[i]});
          if (product) {
            brand = {
              id: product['brand_id'],
              name: product.brand,
            };
            break;
          }
        }
      }
      return brand;
    }

    /**
     * @ngdoc function
     * @name updatedStyle
     * @description
     * function run for cleaning *after* getting the updated image for product
     *
     */
    function updatedStyle() {
      vm.isFavorite = false;
    }

    function setVisableProducts() {
      if (browserWidth > 1050) {
        vm.totalVisible = 50;
      } else {
        vm.totalVisible = 24;
      }
    }

    function trackView() {
      segment.track(segment.events.STYLECREATOR_VIEWED, {
        department : department.name
      });
    }

    function trackGenerated() {
      segment.track(segment.events.STYLECREATOR_GENERATED_STYLE, {
        department : department.name
      });
    }

    function goToProduct(productId) {
      if (vm.mobileApp) {
        appAction('product', productId);
      }
      else {
        $state.go('product-configurable', {id: productId});
      }
    }

    function appAction(action, data) {
      var protocol = 'stylecreator://';
      //todo, add actions for add to cart, go to product and share
      if (typeof data !== 'undefined') {
        action += '/' + data;
      }
      window.location.href = protocol + action;
    }

    function setActiveGender(gender) {
      vm.activeGender = gender;
    }

    //repeat out more products on scroll
    angular.element($window).bind('scroll', creatorScroll);

    function creatorScroll() {
      vm.imageInvis = false;
      var windowHeight = 'innerHeight' in window ? window.innerHeight : document.documentElement.offsetHeight;
      var body = document.body, html = document.documentElement;
      var docHeight = Math.max(
        body.scrollHeight, body.offsetHeight, html.clientHeight,
        html.scrollHeight, html.offsetHeight);
      var imageHeight = document.getElementById('image-area').offsetHeight;
      var windowBottom = windowHeight + window.pageYOffset;
      if (windowBottom >= (docHeight - 200)) {
        vm.totalVisible += 24;
        $scope.$apply();
      }
      if (window.pageYOffset >= imageHeight) {
        vm.imageInvis = true;
        $scope.$apply();
      } else {
        vm.imageInvis = false;
        $scope.$apply();
      }
    }

    //unbind scroll event on destroy
    $scope.$on('$destroy', function() {
      angular.element($window).unbind('scroll', creatorScroll);
      footerFactory.setVisibility(true);
    });
    /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
  }
}());
