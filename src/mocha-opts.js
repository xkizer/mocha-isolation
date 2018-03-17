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
const program = require('commander');
const path = require('path');
const fs = require('fs');
const resolve = path.resolve;
const exists = fs.existsSync;
const join = path.join;
const cwd = process.cwd();

const list = str => str.split(/ *, */);
const collect = (val, memo) => memo.concat(val);
program
  .option('-A, --async-only', 'force all tests to take a callback (async) or return a promise')
  .option('-c, --colors', 'force enabling of colors')
  .option('-C, --no-colors', 'force disabling of colors')
  .option('-G, --growl', 'enable growl notification support')
  .option('-O, --reporter-options <k=v,k2=v2,...>', 'reporter-specific options')
  .option('-R, --reporter <name>', 'specify the reporter to use', 'spec')
  .option('-S, --sort', 'sort test files')
  .option('-b, --bail', 'bail after first test failure')
  .option('-d, --debug', "enable node's debugger, synonym for node --debug")
  .option('-g, --grep <pattern>', 'only run tests matching <pattern>')
  .option('-f, --fgrep <string>', 'only run tests containing <string>')
  .option('-gc, --expose-gc', 'expose gc extension')
  .option('-i, --invert', 'inverts --grep and --fgrep matches')
  .option('-r, --require <name>', 'require the given module')
  .option('-s, --slow <ms>', '"slow" test threshold in milliseconds [75]')
  .option('-t, --timeout <ms>', 'set test-case timeout in milliseconds [2000]')
  .option('-u, --ui <name>', `specify user-interface ()`, 'bdd')
  .option('-w, --watch', 'watch files for changes')
  .option('--check-leaks', 'check for global variable leaks')
  .option('--full-trace', 'display the full stack trace')
  .option('--compilers <ext>:<module>,...', 'use the given module(s) to compile files', list, [])
  .option('--debug-brk', "enable node's debugger breaking on the first line")
  .option('--globals <names>', 'allow the given comma-delimited global [names]', list, [])
  .option('--es_staging', 'enable all staged features')
  .option('--harmony<_classes,_generators,...>', 'all node --harmony* flags are available')
  .option('--preserve-symlinks', 'Instructs the module loader to preserve symbolic links when resolving and caching modules')
  .option('--icu-data-dir', 'include ICU data')
  .option('--inline-diffs', 'display actual/expected differences inline within each string')
  .option('--no-diff', 'do not show a diff on failure')
  .option('--inspect', 'activate devtools in chrome')
  .option('--inspect-brk', 'activate devtools in chrome and break on the first line')
  .option('--interfaces', 'display available interfaces')
  .option('--no-deprecation', 'silence deprecation warnings')
  .option('--exit', 'force shutdown of the event loop after test run: mocha will call process.exit')
  .option('--no-timeouts', 'disables timeouts, given implicitly with --debug')
  .option('--no-warnings', 'silence all node process warnings')
  .option('--opts <path>', 'specify opts path', 'test/mocha.opts')
  .option('--perf-basic-prof', 'enable perf linux profiler (basic support)')
  .option('--napi-modules', 'enable experimental NAPI modules')
  .option('--prof', 'log statistical profiling information')
  .option('--log-timer-events', 'Time events including external callbacks')
  .option('--recursive', 'include sub directories')
  .option('--reporters', 'display available reporters')
  .option('--retries <times>', 'set numbers of time to retry a failed test case')
  .option('--throw-deprecation', 'throw an exception anytime a deprecated function is used')
  .option('--trace', 'trace function calls')
  .option('--trace-deprecation', 'show stack traces on deprecations')
  .option('--trace-warnings', 'show stack traces on node process warnings')
  .option('--use_strict', 'enforce strict mode')
  .option('--watch-extensions <ext>,...', 'additional extensions to monitor with --watch', list, [])
  .option('--delay', 'wait for async suite definition')
  .option('--allow-uncaught', 'enable uncaught errors to propagate')
  .option('--forbid-only', 'causes test marked with only to fail the suite')
  .option('--forbid-pending', 'causes pending tests and test marked with skip to fail the suite')
  .option('--file <file>', 'include a file to be ran during the suite', collect, []);

let globals = [];
const requires = [];

program.on('option:globals', val => {
  globals = globals.concat(list(val));
});

module.paths.push(cwd, join(cwd, 'node_modules'));

program.on('option:require', mod => {
  const abs = exists(mod) || exists(`${mod}.js`);
  if (abs) {
    mod = resolve(mod);
  }
  requires.push(mod);
});

function parseProcessArgs() {
  program.parse(process.argv);
  return {
    globals: globals,
    requires: requires,
    //grep: program.grep,
    //fgrep: program.fgrep,
    //invert: program.invert,
    //ui: program.ui,
    //reporter: 'json',
    //reporterOptions: program.reporterOptions,
    timeout: program.timeout | 999999,
    slow: program.slow | 1000,
    delay: program.delay,
    //bail: program.bail,
    //retries: program.retries,
    useColors: false, // program.useColors,
    //growl: program.growl,
    //asyncOnly: program.asyncOnly,
    ignoreLeaks: program.ignoreLeaks,
    //fullStackTrace: program.fullStackTrace,
    //asyncOnly: program.asyncOnly,
    allowUncaught: program.allowUncaught,
    //forbidOnly: program.forbidOnly,
    //forbidPending: program.forbidPending,
    //useInlineDiffs: program.useInlineDiffs,
    //hideDiff: program.hideDiff,
    //noHighlighting: program.noHighlighting,
  };
}

let _mochaOpts = null;

module.exports = function () {
  if (!_mochaOpts) {
    _mochaOpts = parseProcessArgs();
  }
  return JSON.parse(JSON.stringify(_mochaOpts));
}