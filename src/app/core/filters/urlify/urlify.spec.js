/* jshint -W117, -W030 */
describe('filter: URLify', function () {
  var filter;

  beforeEach(function () {
    bard.appModule('RidestoreApp');
    bard.inject('$filter');
    filter = $filter('urlify');
  });

  it('should be created successfully', function () {
    expect(filter).to.be.defined;
  });

  describe('Convert spaces to hifens', function () {
    it('should convert a space into a -', function () {
      expect(filter('ihave space')).to.be.equal('ihave-space');
    });

    it('should convert multiple spaces into -', function () {
      expect(filter('i have several spaces')).to.be.equal('i-have-several-spaces');
    });
  });

  describe('Convert å to a', function () {
    it('should convert å into a', function () {
      expect(filter('armbågsskydd')).to.be.equal('armbagsskydd');
    });

    it('should convert multiple å into a', function () {
      expect(filter('armbågsskydd-armbågsskydd')).to.be.equal('armbagsskydd-armbagsskydd');
    });
  });

  describe('Convert ä to a', function () {
    it('should convert ä into a', function () {
      expect(filter('snowboardhjälm')).to.be.equal('snowboardhjalm');
    });

    it('should convert multiple ä into a', function () {
      expect(filter('hjälm-snowboardhjälm')).to.be.equal('hjalm-snowboardhjalm');
    });
  });

  describe('Convert ö to o', function () {
    it('should convert ö into an o', function () {
      expect(filter('crossglasögon')).to.be.equal('crossglasogon');
    });

    it('should convert multiple ö into o', function () {
      expect(filter('crossglasögon-tillbehör')).to.be.equal('crossglasogon-tillbehor');
    });
  });

  describe('Convert everything to lowercase', function() {
    it('should convert an entire word to lowercase', function () {
      expect(filter('HELLO')).to.be.equal('hello');
    });
  });

  describe('Mixed conversions', function() {
    it('should convert several combinations of åöä and spaces into their respective post-filter versions', function () {
      /* jshint -W101 */
      // jscs:disable maximumLineLength
      expect(filter('Å Ö Ä crossglasögon Armbågsskydd snowboardhjälm tillbehör hjälm')).to.be.equal('a-o-a-crossglasogon-armbagsskydd-snowboardhjalm-tillbehor-hjalm');
    });
  });

});
