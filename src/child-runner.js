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
const path = require('path');
const child_process = require('child_process');
const mochaOptions = require('./mocha-opts');
const debug = require('./debug-output');

class ChildRunner {

  constructor() {
    const self = this;

    this.exited = false;
    this.fname = null;
    this.waiting = {};
    this.callseq = Math.floor(Math.random() * 2000000000);
    this.child = child_process.fork(path.resolve(__dirname, './child-host.js'), this.opts());
    this.child.on('exit', (code, sig) => { self.onClose(code, sig); });
    this.child.on('message', (msg) => {
      if (msg.mochaReply) {
        self.onReply(msg);
      }
    });
  }

  opts() {
    return {
      cwd: process.cwd(),
    }
  }

  close() {
    if (this.exited) {
      return Promise.resolve();
    }
    return this.sendCommand('shutdown', {})
      .then(() => {
        debug(`Killing child ${this.child.pid}`);
        this.child.kill();
      });
  }

  onClose(code, sig) {
    debug(`Child ${this.child.pid} exited with ${code}|${sig}`);
    this.exited = code;
  }

  onReply(msg) {
    const self = this;
    debug(`reply: ${JSON.stringify(msg)}`);
    const callId = msg.callId;
    const callback = self.waiting[callId];
    delete self.waiting[callId];
    if (callback) {
      if (msg.type === 'complete') {
        return callback(null, msg.result);
      }
      else if (msg.type === 'error') {
        const eresult = msg.error || {};
        const err = new Error(eresult.message || 'Unknown error response.');
        return callback(Object.assign(err, eresult));
      }
      else {
        return callback(new Error(`Unknown message response: ${msg.type}`));
      }
    }
  }

  sendCommand(name, arg) {
    const self = this;
    if (self.exited !== false) {
      return Promise.reject(new Error('Child has already exited.'));
    }

    let callId = (self.callseq++).toString();

    return new Promise((accept, reject) => {
      self.waiting[callId] = (err, res) => {
        if (err) {
          debug(`Rejected: ${err.message}`);
          return reject(err);
        }
        return accept(res);
      }

      self.child.send({
        mochaAction: true,
        callId: callId,
        type: name,
        arg: arg
      }, error => {
        if (error) {
          delete self.waiting[callId];
          return reject(error);
        }
      });
    });
  }

  addFile(filename, suite) {
    const self = this;
    if (self.fname === filename) {
      return Promise.resolve(self);
    }

    let options = {};
    try { options = mochaOptions(suite); }
    catch (ex) { debug(ex); }

    return self.sendCommand('addFile', { filename: filename, options: options })
      .then(() => {
        self.fname = filename;
        return self;
      });
  }

  testRun(title, hash) {
    const self = this;
    return self.sendCommand('testRun', { title: title, hash: hash });
  }
}

module.exports = ChildRunner;