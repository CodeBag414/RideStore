/* jshint -W117, -W030 */
describe('SearchController', function () {
  var controller;

  beforeEach(function () {
    bard.appModule('RidestoreApp');
    bard.inject('$controller', '$log', '$rootScope', '$httpBackend');
  });

  beforeEach(function () {
    $httpBackend.expectGET(/translations/)
    .respond(function (method, url, data, headers) {
      return [400, 'response body', {}, 'TestPhrase'];
    });

    $httpBackend.flush();
    var scope = $rootScope;
    controller = $controller('SearchController', {$scope : scope});
    $rootScope.$apply();
  });

  bard.verifyNoOutstandingHttpRequests();

  describe('Search Controller', function () {
    it('should be created successfully', function () {
      expect(controller).to.be.defined;
    });

  });
});
