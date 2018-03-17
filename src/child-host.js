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
const commonUtil = require('./common-util');
const debug = require('./debug-output');

// Indicates we should not again wrap test delegates
global['mocha-isolation'] = true;
debug(`child pid = ${process.pid}`);

let mtest = null;
const allTests = [];
const beforeAll = [];
const afterAll = [];
const testMap = {};

function addAllTests(suite) {
  if (!suite) return;
  (suite.tests || []).forEach(t => allTests.push(t));
  (suite._beforeAll || []).forEach(t => beforeAll.push(t));
  if (Array.isArray(suite.suites)) {
    suite.suites.forEach(s => addAllTests(s));
  }
  (suite._afterAll || []).forEach(t => afterAll.push(t));
}

function runAsPromise(test) {
  return new Promise((accept, reject) => {
    test.run(err => {
      if (err) return reject(err);
      return accept();
    });
  });
}

function sequenceTests(arr) {
  let promise = Promise.resolve();
  arr.forEach(test => {
    promise = promise.then(() => runAsPromise(test));
  });
  return promise;
}

function beforeEach(test) {
  let resolved = null;
  let current = test;
  while (current) {
    (current._beforeEach || []).forEach(test => {
      resolved = runAsPromise(test).then(resolved);
    });

    if (current.root) break;
    current = current.parent;
  }
  return Promise.resolve(resolved);
}

function afterEach(test) {
  let resolved = Promise.resolve();
  let current = test;
  while (current) {
    (current._afterEach || []).forEach(test => {
      resolved = resolved.then(() => runAsPromise(test));
    });

    if (current.root) break;
    current = current.parent;
  }
  return Promise.resolve(resolved);
}

const actions = {
  ping: function () {
    return 'pong';
  },

  addFile: function (arg) {
    if (arg.options && Array.isArray(arg.options.requires)) {
      arg.options.requires.forEach(mod => {
        debug(`loading module: ${mod}`);
        require(mod);
      });
    }

    debug(`loading path: ${arg.filename}`);
    // Using a grep expression to force mocha to load, but not run, all suite/tests first...
    mtest = new Mocha(Object.assign({}, arg.options,
      { grep: /^ignore-all-tests-mocha-isolation-daqgqc2b6Sy7KW7uF74xFRjdatY8k46a$/, reporter: require('./mocha-reporter') }));
    mtest.addFile(arg.filename);

    return runAsPromise(mtest)
      .then(() => {
        addAllTests(mtest.suite);
        allTests.forEach(test => {
          // Compute a unique hash for this test
          const testHash = commonUtil.hashTest(test);
          testMap[testHash] = test;
        });
      })
      .then(() => {
        return sequenceTests(beforeAll);
      });
  },

  testRun: function (arg) {
    debug(`testRun for: ${JSON.stringify(arg)}`);
    const runnable = testMap[arg.hash];
    if (!runnable || runnable.fullTitle() !== arg.title) {
      debug(`Unable to locate ${JSON.stringify(arg)} in ${Object.keys(testMap)}, found ${runnable}`);
      return Promise.reject(new Error(`mocha-isolation: Runnable not found: ${arg.hash} / '${arg.title}'`))
    }

    return beforeEach(runnable)
      .then(() => runAsPromise(runnable))
      .then(() => afterEach(runnable));
  },

  shutdown: function (/*arg*/) {
    debug('Running teardown.');
    return sequenceTests(afterAll);
  }
}

function doAction(msg) {
  Promise.resolve(msg)
    .then(msg => {
      return Promise.resolve(actions[msg.type](msg.arg));
    })
    .then(result => {
      process.send({
        mochaReply: true,
        callId: msg.callId,
        type: 'complete',
        result: result
      });
    })
    .catch(ex => {
      process.send({
        mochaReply: true,
        callId: msg.callId,
        type: 'error',
        error: {
          message: ex.message,
          name: ex.name,
          stack: ex.stack
        }
      });
    })
    .catch(ex => debug(ex));
}

process.on('message', (msg) => {
  if (msg && msg.mochaAction) {
    debug(`Process message: ${JSON.stringify(msg)}`);
    setImmediate(() => doAction(msg));
  }
});
