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
const ChildRunner = require('./child-runner');

class ChildTracker {
  constructor() {
    this.fname = null;
    this.runner = null;
  }

  closeAll() {
    const self = this;
    return Promise.resolve(self.runner)
      .then(old => {
        self.fname = null;
        self.runner = null;
        if (old) return old.close();
      })
  }

  changeFile(testFile) {
    const self = this;
    if (!self.runner || self.fname !== testFile) {
      self.runner = Promise.resolve(self.runner)
        .then(old => {
          if (old) return old.close();
        })
        .then(() => {
          self.fname = testFile;
          const runner = new ChildRunner();
          return runner.addFile(testFile)
            .then(() => runner);
        });
    }
    return Promise.resolve(self.runner);
  }
}

module.exports = ChildTracker;
