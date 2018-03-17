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

  before(async () => {
    // console.log("before");
    should.equal((this as any).title, 'Isolated Tests');
  });
  after(() => {
    // console.log("after");
    should.equal((this as any).title, 'Isolated Tests');
  });

  describe('in isolation', function () {
    should.equal((this as any).title, 'in isolation');

    beforeEach(() => {
      // console.log("beforeEach");
      should.equal((this as any).title, 'in isolation');
    });
    afterEach(() => {
      // console.log("afterEach");
      should.equal((this as any).title, 'in isolation');
    });

    it('has context sync', function () {
      /* console.log('Test RAN!'); */
      should.equal(this.test.title, 'has context sync');
    });

    it('has context done', function (done) {
      should.equal(this.test.title, 'has context done');
      done();
    });

    it('has context async', async function () {
      should.equal(this.test.title, 'has context async');
    });
  });
});