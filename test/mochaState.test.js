/*
 * ****************************************************************************
 * Copyright (C) 2018-2018 WeWill3C, LLC dba Now IMS, All rights reserved.
 * Project: ims-datamodel
 * Modified By: rogerk
 * Created On: March 16th, 2018
 * Last Modified: March 17th, 2018
 * ****************************************************************************
 */
require('mocha');
const should = require('should');

describe('Isolated Tests', function () {
  should.equal(this.title, 'Isolated Tests');
  should(this.retries).be.a.Function();
  should(this.slow).be.a.Function();
  should(this.timeout).be.a.Function();

  before(function (done) {
    // console.log("before");
    should.equal(this.test.title, '"before all" hook');
    should(this.retries).be.a.Function();
    should(this.slow).be.a.Function();
    should(this.timeout).be.a.Function();
    done();
  });
  after(function () {
    // console.log("after");
    should.equal(this.test.title, '"after all" hook');
    should(this.retries).be.a.Function();
    should(this.slow).be.a.Function();
    should(this.timeout).be.a.Function();
  });

  describe('in isolation', function () {
    should.equal(this.title, 'in isolation');
    should(this.retries).be.a.Function();
    should(this.slow).be.a.Function();
    should(this.timeout).be.a.Function();

    beforeEach(function () {
      // console.log("beforeEach");
      should.equal(this.test.title, '"before each" hook');
      should(this.retries).be.a.Function();
      should(this.slow).be.a.Function();
      should(this.timeout).be.a.Function();
    });
    afterEach(function () {
      // console.log("afterEach");
      should.equal(this.test.title, '"after each" hook');
      should(this.retries).be.a.Function();
      should(this.slow).be.a.Function();
      should(this.timeout).be.a.Function();
    });

    it('has context sync', function () {
      /* console.log('Test RAN!'); */
      should.equal(this.test.title, 'has context sync');
      should(this.retries).be.a.Function();
      should(this.slow).be.a.Function();
      should(this.timeout).be.a.Function();
      should(this.skip).be.a.Function();
    });

    it('has context done', function (done) {
      should.equal(this.test.title, 'has context done');
      should(this.retries).be.a.Function();
      should(this.slow).be.a.Function();
      should(this.timeout).be.a.Function();
      should(this.skip).be.a.Function();
      done();
    });
  });
});