/**
* Configurable product
*
* Ridestore AB
*/
(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('ColorsController', ColorsController);

  ColorsController.$inject = [];

  function ColorsController () {

    var vm = this;
    var callback = 'JSON_CALLBACK';

    /* elements */
    var target = document.getElementById('carousel');
    var ul = target.getElementsByClassName('images')[0];
    var li = ul.getElementsByTagName('li');

    /* counters */
    var a = 0;
    var b = 0;
    var c = li.length - 1;

    /* widths */
    var imageWidth = li[0].offsetWidth;
    var moveWidth = imageWidth + (imageWidth * 0.6);

    /* set overlay position */
    target.getElementsByClassName('circle')[0].style.top = ((imageWidth * 1.1765) + 66) + 'px';
    target.style.height = imageWidth * 1.1765 + 34 + 'px';

    /* reset carousel */
    var resetCarousel = function() {
      for (var a = 0; a < li.length; ++a) {
        li[a].classList.remove('active');
        li[a].classList.remove('rotate-p');
        li[a].classList.remove('rotate-p1');
        li[a].classList.remove('rotate-m');
        li[a].classList.remove('rotate-m1');
        li[a].style.left = 0;
      }
    };

    /* carousel function */
    var doCarousel = function(data) {
      resetCarousel();

      for (var a = 0; a < li.length; ++a) {
        li[a].setAttribute('data-id', a);
        li[a].style.zIndex = a;

        if (a === data) {
          li[a].classList.add('active');
          li[a].style.left = 0;
          target.className = 'bg-' + li[a].getAttribute('data-color');
        } else if (a === data + 1) {
          li[a].classList.add('rotate-p');
          li[a].style.left = moveWidth + 'px';
        } else if (a > data + 1) {
          li[a].classList.add('rotate-p1');
          li[a].style.left = (moveWidth * 2) + 'px';
        } else if (a === data - 1) {
          li[a].classList.add('rotate-m');
          li[a].style.left = -moveWidth + 'px';
        } else if (a < data - 1) {
          li[a].classList.add('rotate-m1');
          li[a].style.left = -(moveWidth * 2) + 'px';
        }
      }
      b = data;
    };

    /* init carousel */
    doCarousel(0);

    /* handlers */
    var bottom = document.getElementById('colorchooser').getElementsByClassName('bottom')[0];

    var bottomli = bottom.getElementsByTagName('li');
    var active = bottom.getElementsByClassName('active')[0];

    for (var i = 0; i < bottomli.length; ++i) {
      bottomli[i].setAttribute('data-color', i);
      bottomli[i].onclick = function(data) {
        doCarousel(parseInt(this.getAttribute('data-color')));
        active.style.top = data.srcElement.offsetTop + 'px';
        active.style.left = data.srcElement.offsetLeft + 40 + 'px';
      };
    }

  }

})();
