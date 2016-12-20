'use strict';

angular
  .module('RidestoreApp')
  .constant('stylecreatorConfig', {
    departments: {
      'snow': [{
        id: '1',
        name: 'snow',
        frontName: 'snow',
        gender: 'men',
        defaultProducts: [284848,282812],
      }],
      'girls-snow': [{
        id: '5',
        name: 'girls-snow',
        frontName: 'snow',
        gender: 'women',
        defaultProducts: [296863,282876],
      }],
      'girls-snowmobile': [{
        id: '6',
        name: 'girls-snowmobile',
        frontName: 'snowmobile',
        gender: 'women',
        defaultProducts: [282812,296863],
      }],/*
      'streetwear': [{
        id: '2',
        name: 'streetwear',
        frontName: 'streetwear',
        gender: 'men',
        defaultProducts: [],
      }],*/
      'snowmobile': [{
        id: '4',
        name: 'snowmobile',
        frontName: 'snowmobile',
        gender: 'men',
        defaultProducts: [282812,284848],
      }],
      'motocross': [{
        id: '3',
        name: 'motocross',
        frontName: 'motocross',
        gender: 'men',
        defaultProducts: [],
      }],
    },
    rules : {
      categories: [755, 936, 1015],
      requiredProductCategories: [754, 935, 1014]
    },
    namingRules: {
      brand: {
        priorities: {
          //Extracted from the following query:
          // SELECT magento_type_id FROM stylecreator2.magento_product_type
          // WHERE product_type_id IN (3,9,20,30) group by magento_type_id
          ids: [182, 184, 269, 274, 894, 1451, 1892],
        }
      }
    },
    style: {
      ACCEPTED: 'ACCEPTED',
      PENDING: 'PENDING',
      REJECTED: 'REJECTED'
    }
  });
