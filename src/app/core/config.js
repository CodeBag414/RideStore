'use strict';

/**
 * @ngdoc overview
 * @name RidestoreApp
 * @description
 * # RidestoreApp
 *
 * Configuration
 */

//todo fix this file that you dont need to change it when using dev
angular
.module('RidestoreApp')
.constant('rsConfig', {
  apiBaseUrl: 'https://dev.ridestore.com/rest-api/v2/',
  stylecreatorApiBaseUrl: 'https://d32p7nik91o3s8.cloudfront.net/',
  stylecreatorAdminApiBaseUrl: 'http://stylecreator-env.eu-west-1.elasticbeanstalk.com/',
  categoryItems: 50,
  blazyParams: {
    container: '.b-lazy-slider',
    offset: 500, //height of biggest thumbnails in ipad
    selector: '.b-lazy',
    src: 'data-src',
    successClass: 'b-loaded',
  },
  auth0: {
    userId: 'uJxd6djMnaQedEKFZ2RlkEUuoHVD9DKK',
    domain: 'erikax.eu.auth0.com'
  },
  gridParams: {
    items: 3,
  },
  filterParams: {
    brands: {
      minAmountVisible: 5,
    },
    categories: {
      minAmountVisible: 5,
    }
  },
  imgix: {
    contentfulDomain: 'https://ridestore-contentful.imgix.net/',
    contentfulReplace: '//images.contentful.com/v40i56j99y5f/',
    domain: 'https://ridestore.imgix.net/',
    baseParams: {
      fit: 'max',
      q: 70,
    },
    sharpenParams: {
      usm: 15,
      chromasub: 444,
    }
  },
  filters: {
    urlPrefix: 'f_',
    apiFormat: 'filter[%FILTER_ID%]',
    filterMap: {
      productType: {
        'filter_code': 'producttype',
        'filter_id': '144',
      },
      department: {
        'filter_code': 'department',
        'filter_id': '129',
      },
      brand: {
        'filter_code': 'brand',
        'filter_id': '127',
      },
    },
  },
  imgixParams: '&dpr=1&auto=format&chromasub=444&q=70&usm=15',
  mediaPath: 'https://d10g92rh9h0kij.cloudfront.net/media',
  isProduction: true,
  contentfulParamsStart : {
    space: 'v40i56j99y5f',
    accessToken: '0dec8cbefb195e90631fd7e1df603ee5fff757bc556aa32160b705473cbd3f40'
  },
  contentfulParamsMain : {
    space: '5u4hf7su2hf7',
    accessToken: 'c96019e9ac6a9357728697b26439df1673a8faa24391d676bfe4c8583dbab52c'
  },
  giftcard: {
    methods: {
      virtual: {
        id: '300393',
        name: 'virtual'
      },
      physical: {
        id: '300392',
        name: 'physical'
      }
    },
    defaultMethod: 'physical',
    categories : [627, 798, 799]
  },
  amp: {
    baseUrl: 'https://ridestore-amp.herokuapp.com/product/'
  },
  shipsTo: [
    'at','be','bg','cy','cz','de','dk',
    'ee','el','es','fi','fr','gb','hr',
    'hu','ie','it','lt','lu','lv','mt',
    'nl','pl','pt','ro','se','si','sk',
    'uk'
  ],
  analyticsExperiments: {
    categoryFewerProducts: {
      longName: 'Category > FewerProducts',
      id: 'PLqqrN43SjqRv0r2l3rHkg',
      categoriesInTest: [
        {
          name: 'streetwear > hoods',
          id: 207,
        },
        {
          name: 'streetwear > shoes',
          id: 218,
        },
        {
          name: 'streetwear > caps',
          id: 209,
        },
        {
          name: 'streetwear > beanies',
          id: 210,
        }
      ]
    },
    checkoutRemoveGuarantees: {
      longName: 'Checkout > Remove Guarantees',
      id: 'SjRfyhhxTpqrF47Dt4TSLw',
      variations: [
        { }, //nothing on the original
        { }  //on experiment group, change the checkoutTemplate
      ]
    }
  },
  sizeConversionTables: {
    shoes: {
      categoryId: '218',
      url: 'assets/db/shoe-size-conversion.json',
    },
  },
});

angular
.module('RidestoreApp')
.config(['contentfulProvider', 'rsConfig', function(contentfulProvider, rsConfig) {
  contentfulProvider.setOptions(rsConfig.contentfulParamsMain);
}]);

angular
.module('RidestoreApp')
.config(['segmentProvider', 'SegmentEvents', function(segmentProvider, SegmentEvents) {
  segmentProvider
    .setKey('2T3U3J56TFCA59xTNPgchLFFKzV3ezsC')
    .setAutoload(false)
    .setEvents(SegmentEvents)
    .setCondition(segmentCallback)
    .setDebug(false);

  segmentCallback.$inject = ['rsConfig'];
  function segmentCallback(rsConfig) {
    return rsConfig.isProduction;
  }

}]);
