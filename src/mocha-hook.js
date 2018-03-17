/******************************************************************************
 * MIT License
 * Copyright (c) 2018 https://github.com/now-ims/
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Created by rogerk on March 17, 2018.
 ******************************************************************************/
const Mocha = require('mocha');
const ChildTracker = require('./child-tracker');
const commonUtil = require('./common-util');
const debug = require('./debug-output');

const Runnable = Mocha.Runnable;
const mochaRun = Runnable.prototype.run;

const children = new ChildTracker();

function shutdownChild(done) {
  debug('shutting down...');
  if (!children.runner) {
    debug('No child to terminate.');
    return done(null);
  }
  children.closeAll()
    .then(() => done())
    .catch(ex => done(ex));
}

const globalHookHash = commonUtil.hashTest({
  type: 'hook',
  fn: shutdownChild,
  fullTitle: () => '"after all" hook'
});

let hookGlobal = () => {
  hookGlobal = () => { };
  global.after(shutdownChild);
};

function wrapTest(ofn, test, testTitle, testHash) {
  hookGlobal();
  if (ofn === shutdownChild) {
    // Do not hook our own event for shutdown
    return ofn;
  }

  return function (done) {
    debug(`${this.test.type}: ${this.test.fullTitle()}`);
    // call original test method in-proc:
    //const args = Array.from(arguments);
    //ofn.call(this, args);
    if (test.type !== 'test') {
      if (testHash === globalHookHash) {
        return ofn.call(this, done);
      }
      return done(); // skip... 
    }
    else if (!test.file) {
      process.emitWarning(`Unable to idetify ${this.test.type}: ${this.test.fullTitle()}`);
      return done(new Error(`Unable to idetify source file ${this.test.type}: ${this.test.fullTitle()}`));
    }

    let suite = test;
    while (suite.parent && !suite.root)
      suite = suite.parent;

    children.changeFile(test.file, suite)
      .then(runner => {
        if (runner.error) {
          return Promise.reject(runner.error);
        }
        return runner.testRun(testTitle, testHash);
      })
      .then(() => done())
      .catch(ex => done(ex));
  };
}

function Runnable_run(callback) {
  if (!this._mh_isHooked) {
    const testTitle = this.fullTitle();
    // Compute a unique hash for this test
    const testHash = commonUtil.hashTest(this);
    // Record that we've trapped this function
    this._mh_hashed = testHash;
    this._mh_isHooked = true;
    // Hijack the test runner
    const testFunc = this.fn;
    this.fn = wrapTest(testFunc, this, testTitle, testHash);
    // Replace `toString` to output the original function contents.
    this.fn.toString = function () { return Function.prototype.toString.call(testFunc); };
    // Force to run async
    this.async = true;
    this.sync = !this.async;
  }

  return mochaRun.call(this, callback);
}

module.exports = function attachMochaHook() {
  const isDebug = process.execArgv.find(arg => /^--(inspect|debug)/.test(arg));
  debug(`is debug = ${isDebug}`);

  if (isDebug) {
    const colors = require('colors/safe');
    /* eslint-disable no-console */
    console.error(colors.dim(colors.yellow('[WARN]: Disabled mocha-isolation for debugging.')));
    /* eslint-enable no-console */
  }
  else if (global['mocha-isolation'] || process.env['mocha_isolation_disable']) {
    debug('[INFO]: Disabled mocha-isolation for this process.');
  }
  else {
    debug('Hooked mocha runnable.');
    Runnable.prototype.run = Runnable_run;
  }
}
