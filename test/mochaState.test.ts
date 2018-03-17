/*
 * ****************************************************************************
 * Copyright (C) 2018-2018 WeWill3C, LLC dba Now IMS, All rights reserved.
 * Project: ims-datamodel
 * Modified By: rogerk
 * Created On: March 16th, 2018
 * Last Modified: March 17th, 2018
 * ****************************************************************************
 */
import 'mocha';
import * as should from 'should';

describe('Isolated Tests', function () {
  should.equal((this as any).title, 'Isolated Tests');
  should(this.retries).be.a.Function();
  should(this.slow).be.a.Function();
  should(this.timeout).be.a.Function();

  before(async function () {
    // console.log("before");
    should.equal(this.test.title, '"before all" hook');
    should(this.retries).be.a.Function();
    should(this.slow).be.a.Function();
    should(this.timeout).be.a.Function();
  });
  after(function () {
    // console.log("after");
    should.equal(this.test.title, '"after all" hook');
    should(this.retries).be.a.Function();
    should(this.slow).be.a.Function();
    should(this.timeout).be.a.Function();
  });

  describe('in isolation', function () {
    should.equal((this as any).title, 'in isolation');
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
      should(this.test.retries).be.a.Function();
      should(this.test.slow).be.a.Function();
      should(this.test.timeout).be.a.Function();
      should(this.test.skip).be.a.Function();
    });

    it('has context done', function (done) {
      should.equal(this.test.title, 'has context done');
      should(this.test.retries).be.a.Function();
      should(this.test.slow).be.a.Function();
      should(this.test.timeout).be.a.Function();
      should(this.test.skip).be.a.Function();
      done();
    });

    it('has context async', async function () {
      should.equal(this.test.title, 'has context async');
      should(this.test.retries).be.a.Function();
      should(this.test.slow).be.a.Function();
      should(this.test.timeout).be.a.Function();
      should(this.test.skip).be.a.Function();
    });
  });
});