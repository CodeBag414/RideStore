(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .config([
    '$locationProvider', '$stateProvider', '$urlMatcherFactoryProvider',
    '$urlRouterProvider', 'lodash',
    function($locationProvider, $stateProvider, $urlMatcherFactoryProvider,
      $urlRouterProvider, lodash) {

      //////////// Configurations
      $urlMatcherFactoryProvider.strictMode(false);

      $stateProvider
      .state('home', {
        url: '/',
        templateUrl: 'app/pages/start/start.html'
      })
      .state('motocross', {
        url: '/motocross',
        templateUrl: 'app/pages/start/start.html',
        params:  {
          department: {
            value: 'Moto'
          }
        }
      })
      .state('skate', {
        url: '/skate',
        templateUrl: 'app/pages/start/start.html',
        params:  {
          department: {
            value: 'Skate'
          }
        }
      })
      .state('skatecamp', {
        url: '/skatecamp',
        templateUrl: 'app/pages/skatecamp/skatecamp.html'
      })
      .state('streetwear', {
        url: '/streetwear',
        templateUrl: 'app/pages/start/start.html',
        params:  {
          department: {
            value: 'Streetwear'
          }
        }
      })
      .state('bike', {
        url: '/bike',
        templateUrl: 'app/pages/start/start.html',
        params:  {
          department: {
            value: 'Bike'
          }
        }
      })
      .state('snow', {
        url: '/snow',
        templateUrl: 'app/pages/start/start.html',
        params:  {
          department: {
            value: 'Snow'
          }
        }
      })
      .state('girls', {
        url: '/girls',
        templateUrl: 'app/pages/start/start.html',
        params:  {
          department: {
            value: 'Girls'
          }
        }
      })
      .state('latest', {
        url: '/latest',
        templateUrl: 'app/pages/latest/latest.html'
      })
      .state('search', {
        url: '/search?{q:string}&{brand:string}&{productype:string}&{size_array:string}',
        templateUrl: 'app/components/search/search.html'
      })
      .state('favorites', {
        url: '/favorites?{sf:string}',
        templateUrl: 'app/components/favorites/shared-favorites/shared-favorites.html'
      })
      .state('brands', {
        url: '/brands',
        templateUrl: 'app/pages/brands/brands.html'
      })
      .state('login', {
        url: '/login?{redirect:string}',
        templateUrl: 'app/pages/account/login/login.html',
        header: {
          design: 'transparent-white',
          scroll: false
        }
      })
      .state('stylecreator', {
        url: '/stylecreator/:department',
        reloadOnSearch: false,
        templateUrl: 'app/pages/stylecreator/stylecreator.html',
        params:  {
          department: {
            value: 'girls-snow',
            squash: true
          }
        }
      })
      .state('contact', {
        url: '/contact',
        templateUrl: 'app/pages/contact/contact.html',
        header: {
          design: 'transparent-white'
        },
        params: {
          responseCode: null
        }
      })
      .state('reviews', {
        url: '/reviews',
        templateUrl: 'app/pages/reviews/reviews.html',
        header: {
          design: 'transparent-white'
        },
        params: {
          responseCode: null
        }
      })
      .state('about', {
        url: '/about',
        templateUrl: 'app/pages/about/about.html',
        header: {
          design: 'transparent-white',
          dropdown: false,
          logo: false
        }
      })
      .state('work', {
        url: '/work/:department',
        templateUrl: 'app/pages/work/work.html',
        header: {
          design: 'transparent-white',
          dropdown: false,
          logo: true
        }
      })
      .state('workentry', {
        url: '/work/:department/:work',
        templateUrl: 'app/pages/jobs/jobs.html',
        header: {
          design: 'transparent-white',
          dropdown: false,
          logo: true
        }
      })
      .state('info', {
        url: '/info/:name',
        templateUrl: 'app/pages/info/info.html',
        params:  {
          name: {
            value: 'terms'
          }
        }
      })
      .state('stickers', {
        url: '/stickers',
        templateUrl: 'app/pages/stickers/stickers.html'
      })
      .state('stickersThanks', {
        url: '/stickers/thanks',
        templateUrl: 'app/pages/stickers/thanks/thanks.html'
      })
      .state('checkout', {
        url: '/checkout',
        templateUrl: 'app/pages/checkout/checkout.html',
        controller: 'CheckoutController',
        controllerAs: 'vm',
        header: {
          design: 'transparent-dark',
          fixed: false,
          minimal: true,
        },
        resolve: {
          checkoutRemoveGuaranteesExperiment: [
            'checkoutRemoveGuaranteesExperiment', function(checkoutRemoveGuaranteesExperiment) {
              return checkoutRemoveGuaranteesExperiment.initialize();
            }
          ]
        }
      })
      .state('checkout-success', {
        url: '/checkout/success',
        templateUrl: 'app/pages/checkout/success/success.html',
        controller: 'CheckoutController',
        controllerAs: 'checkout',
        header: {
          design: 'transparent-dark',
          fixed: false,
          minimal: true,
        },
        reloadOnSearch: false,
        resolve: {
          checkoutRemoveGuaranteesExperiment: [
            'checkoutRemoveGuaranteesExperiment', function(checkoutRemoveGuaranteesExperiment) {
              return checkoutRemoveGuaranteesExperiment.initialize();
            }
          ]
        }
      })
      .state('instant-checkout', {
        url: '/instant-checkout/:productId?{options:string}',
        template: '<instant-checkout></instant-checkout>',
      })
      .state('instant-checkout-success', {
        url: '/instant-checkout/success/:cartId',
        template: '<instant-checkout></instant-checkout>',
      })
      .state('404', {
        templateUrl: 'app/pages/404/404.html',
        header: {
          design: 'transparent-white'
        }
      })
      .state('colors', {
        url: '/product/colors',
        templateUrl: 'app/pages/product/colors/colors.html'
      })
      .state('orders', {
        url: '/orders?{pin:int}&{phonenumber:string}',
        templateUrl: 'app/pages/account/orders/orders.html',
        params: {
          responseCode: null
        }
      })
      .state('webadmin', {
        url: '/webadmin',
        templateUrl: 'app/pages/webadmin/webadmin.html',
        resolve: {
          loadAdminFiles: ['$injector', function($injector) {
            var adminAuthenticationService = $injector.get('adminAuthenticationService');
            return adminAuthenticationService.loadFiles();
          }]
        }
      })
      .state('webadmin/ean-scanner', {
        url: '/webadmin/ean-scanner',
        template: '<ean-scanner></ean-scanner>',
        resolve: {
          loadAdminFiles: ['$injector', function($injector) {
            var adminAuthenticationService = $injector.get('adminAuthenticationService');
            return adminAuthenticationService.loadFiles();
          }]
        }
      })
      .state('webadmin/crud-editor', {
        url: '/webadmin/crud-editor',
        template: '<crud-editor></crud-editor>',
        resolve: {
          loadAdminFiles: ['$injector', function($injector) {
            var adminAuthenticationService = $injector.get('adminAuthenticationService');
            return adminAuthenticationService.loadFiles();
          }]
        }
      })
      .state('product-configurable', {
        params: {
          id: {
            array: false
          },
          url: {
            array: false
          },
          responseCode: null,
        },
        templateUrl: 'app/pages/product/configurable.html'
      })
      .state('product-style', {
        params: {
          id: {
            array: false
          },
          url: {
            array: false
          },
          responseCode: null,
        },
        templateUrl: 'app/pages/style/style.html'
      })
      .state('product-giftcard', {
        params: {
          id: {
            array: false
          },
          url: {
            array: false
          },
          responseCode: null
        },
        templateUrl: 'app/pages/giftcard/giftcard.html'
      })
      .state('category/set-color', {
        templateUrl: 'app/pages/category/category.html',
        controller: 'CategoryController',
        controllerAs: 'category',
        reloadOnSearch: false,
        url: '/category/setColor',
        params: {
          id: 'getAllProductsWithoutColor'
        },
        resolve: {
          categoryFewerProductsExperiment:[
            '$injector', '$stateParams',
            function($injector, $stateParams) {
              return {};
            }]
        }
      })
      .state('category', {
        params: {
          id: {
            array: false
          },
          url: {
            array: false
          },
          filter: {
            array: false
          },
          responseCode: null,
          message: {
            array: false
          },
          totalVisible : {
            array: false
          }
        },
        templateUrl: 'app/pages/category/category.html',
        controller: 'CategoryController',
        controllerAs: 'category',
        reloadOnSearch: false,
        resolve: {
          categoryFewerProductsExperiment: [
            '$injector', '$stateParams',
            function($injector, $stateParams) {
              //NOTE: the use of `var $stateParams = $injector.get('$stateParams');` doesn't work
              // here, the variables are not passed in time by the injector, hence the use of $stateParams on top
              var $window = $injector.get('$window');
              var rsConfig = $injector.get('rsConfig');
              var lodash = $injector.get('lodash');

              var categoryId = $stateParams.id;

              if (!$window.experiments || !categoryId) {
                return;
              }

              var experiment = rsConfig.analyticsExperiments.categoryFewerProducts;

              if (!lodash.find($window.experiments, ['id', experiment.id])) {
                //not assigned to this experiment
                return;
              }

              //if the category id is in test, then set experiment
              if (lodash.find(experiment.categoriesInTest, ['id', parseInt(categoryId)])) {
                var analyticsExperimentsService = $injector.get('analyticsExperimentsService');
                return analyticsExperimentsService.setupExperiment(experiment.id)
                  .then(function(experiment) { return experiment; });
              }
              return;
            }
          ]
        }
      })
      .state('giftcard', {
        url: '/giftcard',
        templateUrl: 'app/pages/giftcard/giftcard.html',
        header: {
          design: 'transparent-white'
        },
      })
      .state('giftcard-success', {
        url: '/giftcard/success/:cartId',
        templateUrl: 'app/pages/giftcard/giftcard.html',
        header: {
          design: 'transparent-white'
        },
      });

      // use the HTML5 History API
      $locationProvider.html5Mode(true);

      // fallback for when route is not found above
      $urlRouterProvider.otherwise(function($injector, $location) {
        var $state = $injector.get('$state');
        var api = $injector.get('api');
        var $stateParams = $injector.get('$stateParams');
        var $sessionStorage = $injector.get('$sessionStorage');
        var params = {};
        var url = stripTrailingSlash($location.path().substring(1));

        // if we reach here from outside, ie: back button or typed url.
        if (lodash.isEmpty($stateParams) || $stateParams.url !== url) {
          if ($sessionStorage.stateHistory[url]) {
            //Read params from sessionStorage
            params = $sessionStorage.stateHistory[url];
            redirectAccordingToParams(params, $state);

          } else {
            if (!localRedirect(url, $state)) {
              api.getRewrite(url)
              .then(function(route) {
                redirectAccordingToRewrite(route, $state);
              });
            }
          }

        }
      });

      // rule to import favorites and/or cart based on url parameters
      $urlRouterProvider.rule(writeCartAndFavsFromParams);

      ////////////

      function redirectAccordingToParams(params, $state) {
        switch (params.type) {
          case 'category':
            $state.go('category', params);
            break;
          case 'product-configurable':
            $state.go('product-configurable', params);
            break;
          case 'product-style':
            $state.go('product-style', params);
            break;
          default:
            $state.go('404');
        }
      }

      function redirectAccordingToRewrite(route, $state) {
        if (typeof route.state !== 'undefined' && (route.returnCode === 200 || route.returnCode === 301)) {
          $state.go(route.state, {
            id: route.id,
            url: route.url,
            responseCode: route.returnCode,
            filter: route.filter,
            message: route.message,
          });
        } else {
          $state.go('404');
        }
      }

      function paramsAreValid(params) {
        if (typeof params.type === 'string' && params.type.length > 0) {
          return true;
        } else {
          console.error('Something went very wrong with the routes.', params);
          return false;
        }
      }

      function writeCartAndFavsFromParams($injector, $location) {
        if ($location.search().cartId) {
          var cart = $injector.get('cart');
          var cartIdToImport = $location.search().cartId;
          cart.reInitCart(cartIdToImport);

          $location.search('cartId', null).replace();
        }

        if ($location.search().favs) {
          var favorites = $injector.get('favorites');
          var favoritesToImport = $location.search().favs;
          var favoritesArray = JSON.parse(favoritesToImport);
          favorites.bulkAddToFavorites(favoritesArray);

          $location.search('favs', null).replace();
        }
      }

      function stripTrailingSlash(str) {
        if (str.substr(-1) === '/') {
          return str.substr(0, str.length - 1);
        }
        return str;
      }

      //temporary redirects for old urls
      function localRedirect(url, $state) {
        var redirects = [
          {url: 'retur', state: 'orders'},
          {url: 'return', state: 'orders'},
          {url: 'palautus', state: 'orders'},
          {url: 'kundservice', state: 'contact'},
          {url: 'omdömen', state: 'reviews'},
          {url: 'checkout/cart', state: 'checkout'},
          {url: 'kopvillkor', state: 'info'},
          {url: 'presentkort', state: 'giftcard'},
          {url: 'terms', state: 'info'},
          {url: 'streetwear/acessoarer/presentkort', state: 'giftcard'},
        ];
        var foundRedirect = lodash.find(redirects, { url: url });
        if (foundRedirect) {
          $state.go(foundRedirect.state, {responseCode: 301});
          return true;
        }
        else {
          return false;
        }
      }

    }
  ]);
}());
