(function() {
  'use strict';

  angular
  .module('RidestoreApp')
  .factory('giftcard', giftcard);

  giftcard.$inject = ['api', 'cart', 'gettext', 'rsConfig'];

  function giftcard(api, cart, gettext, rsConfig) {
    var defaultMethod = rsConfig.giftcard.defaultMethod;
    var giftcardMethods = rsConfig.giftcard.methods;

    var options;
    var card = {
      amount: '',
      senderName: '',
      recipientName: '',
      senderEmail: '',
      recipientEmail: '',
      msg: '',
      method: ''
    };

    return {
      getCard: getCard,
      setCard: setCard,

      isVirtual: isVirtual,
      isPhysical: isPhysical,

      addToCart: addToCart,
      instantCheckout: instantCheckout,

      methods: giftcardMethods,
      defaultMethod : defaultMethod,
    };

    ////////////

    function getCard() {
      return card;
    }

    function setCard(options) {
      if (!options || !options.method || !options.amount || !options.senderName || !options.recipientName) {
        return;
      }

      setAmount(options.amount);
      setName('senderName', options.senderName);
      setName('recipientName', options.recipientName);

      setMethod(options.method);

      if (options.method === 'virtual' && options.senderEmail && options.recipientEmail) {
        setEmail('senderEmail', options.senderEmail);
        setEmail('recipientEmail', options.recipientEmail);
      }

      if (options.msg) {
        setMsg(options.msg);
      }

      return card;
    }

    ////////////

    function isVirtual() {
      return card.method === 'virtual';
    }

    function isPhysical() {
      return card.method === 'physical';
    }

    ////////////

    function addToCart() {

      var options = {
        'amount': card.amount,
        'sname': card.senderName,
        'rname': card.recipientName,
      };

      return cart.addGiftcardToCart(options);
    }

    function instantCheckout() {
      return addToTempCart().then(function(res) {
        return {status: 'success', cartId: res.data.cartId, configId: giftcardMethods.virtual.id};
      }, function(reason) {
        var message = gettext('Error adding Giftcard to cart.');
        api.displayErrorToast(message, reason);
        return 'error';
      });

    }

    function addToTempCart() {
      var endpointUrl = 'carts/add/product/' +
        giftcardMethods.virtual.id;

      var options = {
        'amount': card.amount,
        'sname': card.senderName,
        'rname': card.recipientName,
        'semail': card.senderEmail,
        'remail': card.recipientEmail,
      };

      return api.performJsonpRequest(endpointUrl, {'options': options}, false);
    }

    //////////// Setters

    function setAmount(amount) {
      if (validAmount(amount)) {
        card.amount = amount;
      }
    }

    function setName(varName, name) {
      if (
        (varName !== 'senderName' && varName !== 'recipientName') ||
        !validName(name)) {
        return;
      }

      card[varName] = name;

    }

    function setEmail(varName, email) {
      if (
        (varName !== 'senderEmail' && varName !== 'recipientEmail') ||
        !validEmail(email)) {
        return;
      }

      card[varName] = email;
    }

    function setMsg(msg) {
      if (validMsg(msg)) {
        card.msg = msg;
      }
    }

    function setMethod(method) {
      if (validMethod(method)) {
        card.method = method;
      }
    }

    //////////// Validation methods

    function validAmount(amount) {
      //TODO: implement better validation
      return parseFloat(amount) > 0;
    }

    function validName() {
      //TODO: implement validation
      return true;
    }

    function validEmail(email) {
      var emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
      return emailRegex.test(email);
    }

    function validMsg(msg) {
      //TODO: implement validation
      return true;
    }

    function validMethod(method) {
      return method === 'virtual' || method === 'physical';
    }

  }
}());
