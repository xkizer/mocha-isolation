require('mocha');
const should = require('should');

describe('Test Process', function () {
  // This will capture as the test is first evaluated in parent process, the child will
  // not replace the value. 
  process.env['mocha-isolation-pid-test'] = process.env['mocha-isolation-pid-test'] || process.pid;

  it('test should run in a different pid', function (done) {
    // Verify that value was provided by the parent process and is a different pid
    should.notEqual(process.env['mocha-isolation-pid-test'], process.pid);
    done();
  });
});
