(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .controller('ContactController', ContactController);

  ContactController.$inject = ['api', 'contentful', 'head', 'locale'];

  function ContactController(api, contentful, head, locale) {
    var vm = this;

    vm.contact = {};
    vm.emailSentMsg = 'Send';
    vm.head = head;
    vm.toggleFAQ = toggleFAQ;
    vm.sendEmail = sendEmail;

    getEntry();

    function getEntry() {
      contentful
      .entries('content_type=contactUs' + '&locale=' + locale.getLocale().replace('_','-'))
      .then(
        // Success handler
        function(response) {
          var entries = response.data;
          if (entries.items.length > 0) {
            vm.content = entries.items[0].fields;
          }
        },
        // Error handler
        function(response) {
          console.log('Oops, error ' + response.status);
        }
      );
    }

    function toggleFAQ(index) {
      if (vm.faqOpen === index) {
        delete vm.faqOpen;
      } else {
        vm.faqOpen = index;
      }

      //scroll if mobile
      if (head.getDevice() === 'mobile') {
        var mobileOffset = 50;
        var targetId = 'faq';
        var scrollDelay = 0;

        if (typeof vm.faqOpen !== 'undefined') {
          targetId = 'question-' + vm.faqOpen;
          //waiting for transition end in ".faq .questions li.open .answer" (ui2.scss)
          scrollDelay = 500;
        }

        head.scrollToById(targetId, mobileOffset, scrollDelay);
      }
    }

    function sendEmail() {
      vm.emailSentMsg = 'Thanks!';
      var message = vm.message;
      var subject = 'contact form on website from: ' + vm.name;
      api.sendEmail({
        'email_id' : 'info',
        'from_email' : vm.email,
        'subject' : subject,
        'message' : message
      });
    }
  }
})();
