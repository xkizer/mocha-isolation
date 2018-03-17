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
const crypto = require('crypto');

module.exports = {
  hashTest: function (test) {
    const testTitle = test.fullTitle();
    const testFuncJS = Function.prototype.toString.call(test.fn).replace(/[\s\r\n]+/gi, ' ');
    // Compute a unique hash for this test
    const hfunc = crypto.createHash('md5');
    hfunc.update(test.type);
    hfunc.update(testTitle);
    hfunc.update(testFuncJS);
    const hash = hfunc.digest("hex");
    return hash;
  }
};