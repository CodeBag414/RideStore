(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('AboutController', AboutController);

  AboutController.$inject = ['head'];

  function AboutController(head) {

    var vm = this;
    vm.head = head;

    /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
    /* jshint -W106 */
    vm.image_path = 'https://d10g92rh9h0kij.cloudfront.net/media/wysiwyg/work/';
    /* jshint +W106 */
    /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
    vm.crew = [
      {
        'name'  : 'Lukas',
        'image' : 'lukas_f.jpg'
      },
      {
        'name'  : 'Jocke',
        'image' : 'jocke.jpg'
      },
      {
        'name'  : 'Anna',
        'image' : 'anna.jpg'
      },
      {
        'name'  : 'Berra',
        'image' : 'berra.jpg'
      },
      {
        'name'  : 'Viktora',
        'image' : 'viktoria.jpg'
      },
      {
        'name'  : 'Jeppe',
        'image' : 'jeppe.jpg'
      },
      {
        'name'  : 'Bubach',
        'image' : 'bubach.jpg'
      },
      {
        'name'  : 'Hanna',
        'image' : 'hanna.jpg'
      },
      {
        'name'  : 'Darius',
        'image' : 'darius.jpg'
      },
      {
        'name'  : 'Philip',
        'image' : 'philip.jpg'
      },
      {
        'name'  : 'Lax',
        'image' : 'lax.jpg'
      },
      {
        'name'  : 'Anders',
        'image' : 'anders.jpg'
      },
      {
        'name'  : 'Sjövall',
        'image' : 'sjovall.jpg'
      },
      {
        'name'  : 'Linus',
        'image' : 'linus.jpg'
      },
      {
        'name'  : 'Barte',
        'image' : 'barte.jpg'
      },
      {
        'name'  : 'Nordén',
        'image' : 'norden.jpg'
      },
      {
        'name'  : 'Henrietta',
        'image' : 'henrietta.jpg'
      },
      {
        'name'  : 'Erika',
        'image' : 'erika.jpg'
      },
      {
        'name'  : 'Jesper',
        'image' : 'jesper.jpg'
      },
      {
        'name'  : 'Eva',
        'image' : 'eva.jpg'
      },
      {
        'name'  : 'Sofia',
        'image' : 'sofia.jpg'
      },
      {
        'name'  : 'Emelie',
        'image' : 'emelie.jpg'
      },
      {
        'name'  : 'Kevin',
        'image' : 'kevin.jpg'
      },
      {
        'name'  : 'Elias',
        'image' : 'elias.jpg'
      },
      {
        'name'  : 'Linn',
        'image' : 'linn.jpg'
      },
      {
        'name'  : 'Lucas',
        'image' : 'lucas-e.jpg'
      },
      {
        'name'  : 'Kathleen',
        'image' : 'kathleen.jpg'
      },
      {
        'name'  : 'Lucas',
        'image' : 'lucas.jpg'
      },
      {
        'name'  : 'Marte',
        'image' : 'marte.jpg'
      },
      {
        'name'  : 'Lucas',
        'image' : 'lucas_e.jpg'
      },
      {
        'name'  : 'Robin',
        'image' : 'robin.jpg'
      },
      {
        'name'  : 'Sara',
        'image' : 'sara.jpg'
      },
      {
        'name'  : 'Anthony',
        'image' : 'anthony.jpg'
      },
      {
        'name'  : 'Nabil',
        'image' : 'nabil.jpg'
      },

    ];

  }

})();
