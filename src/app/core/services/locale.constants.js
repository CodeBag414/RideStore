angular
  .module('RidestoreApp')
  .constant('localeConfig', {
    stores: {
      'com': {
        id: 'com',
        name: 'Global',
        lang: 'en',
        locale: 'en_GB',
        ngLocale: 'en-gb',
        currency: '€',
        currencyCode: 'EUR',
        giftcard: {
          amount: {
            min: '10',
            step: '1',
          }
        },
        algoliaIndex: 'products_eu',
      },
      'se': {
        id: 'se',
        name: 'Sweden',
        lang: 'sv',
        locale: 'sv_SE',
        ngLocale: 'sv-se',
        currency: 'kr',
        currencyCode: 'SEK',
        giftcard: {
          amount: {
            min: '100',
            step: '10',
          }
        },
        algoliaIndex: 'products_se',
        default: true,
      },
      'no': {
        id: 'no',
        name: 'Norway',
        lang: 'nb',
        locale: 'nb_NO',
        ngLocale: 'nb-no',
        currency: 'kr',
        currencyCode: 'NOK',
        giftcard: {
          amount: {
            min: '100',
            step: '10',
          }
        },
        algoliaIndex: 'products_no',
      },
      'fi': {
        id: 'fi',
        name: 'Finland',
        lang: 'fi',
        locale: 'fi_FI',
        ngLocale: 'fi-fi',
        currency: '€',
        currencyCode: 'EUR',
        giftcard: {
          amount: {
            min: '10',
            step: '1',
          }
        },
        algoliaIndex: 'products_fi',
      },
      'de': {
        id: 'de',
        name: 'Germany',
        lang: 'de',
        locale: 'de_DE',
        ngLocale: 'de-de',
        currency: '€',
        currencyCode: 'EUR',
        giftcard: {
          amount: {
            min: '10',
            step: '1',
          }
        },
        algoliaIndex: 'products_de',
      },
    }
  });
