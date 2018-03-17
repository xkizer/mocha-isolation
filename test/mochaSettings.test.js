
require('mocha');
const should = require('should');

describe('Mocha Settings', function () {
  should.equal(this.title, 'Mocha Settings');
  should.equal(this.retries(), -1);
  should.equal(this.slow(), 1234);
  should.equal(this.timeout(), 2345);

  it('will assert settings', function (done) {
    // console.log("before");
    should.equal(this.test.title, 'will assert settings');
    should(this.retries).be.a.Function();
    should(this.slow).be.a.Function();
    should(this.timeout).be.a.Function();
    done();
  });
});