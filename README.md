# mocha-isolation
Provides process isolation for each test file running in mocha while preserving the single-run ease-of-use and reporting.

`mocha-isolation` provides process isolation for each test file running in mocha. Each test file (javascript or typescript) runs in complete isolation from the parent mocha process. The root mocha process remains unaltered in it's knowledge that all the tests have run, and has full access to their success/failure outcome and error/stack trace. This provides a seamless reporting/running experience.

In addition to mocha reporting remaining unaware of the isolation, we have tested with [istanbuljs/nyc](https://github.com/istanbuljs/nyc) to ensure that code coverage can still be maintained seamlessly.

The ability to debug running mocha tests is also an important part of the development process. To better support debugging, `mocha-isolation` will automatically disable itself when it detects the process is listening for a debugger.

Due to the mechanics used for test isolation, I can not speak to the usability of this with browser-based tests, nor are there plans to support that endeavor. If you wish to contribute, please feel free to get in contact or send a pull request.

# Getting started

In your node root, run:

```bash
npm install --save-dev mocha-isolation
```

Add the following argument when running your mocha tests...

```bash
mocha --require mocha-isolation ./tests/*.js
```

Alternatively, you can specify the require argument in test/mocha.opts see https://mochajs.org/#mochaopts

# Environment and Globals

You can use `global['mocha-isolation']` to determine if your code is running in an isolated child process:
```javascript
describe('foo', () => {
  it('bar', () => {
    if (global['mocha-isolation']) {
      console.log('running in isolation.');
    }
  })
});
```

`mocha_isolation_debug` existing as any 'truthy' value will enable diagnostic output in the console.
```bash
 export mocha_isolation_debug=1
```

`mocha_isolation_disable` existing as any 'truthy' value will disable the plugin for all processes.
```bash
 export mocha_isolation_disable=1
```



# How it works
The isolation is provided by forking the current node process with [`child_process.fork`](https://nodejs.org/api/child_process.html#child_process_child_process_fork_modulepath_args_options). The forked process has full access to stdout/stderr, environment settings, command-line arguments, etc. The primary difference in runtime is the execution of before/after scopes, which are explained in more detail below. 

## Basic test flow
- Mocha loads the environment and test suites.
- `mocha-isolation` replaces Mocha's `Runnable.prototype.run` with it's own method.
- Mocha decides which tests to run and in what order.
- When a runnable's `.run()` is called, `mocha-isolation` takes over execution as follows:
  - Inspect the runnable, if it's a hook (before, after, beforeEach, afterEach) the execution is cancelled.
  - If the runnable is a test, it spins up a test process for that test's source file. This includes running any global before hooks loaded by that source file.
  - The test's properties (name, etc) are passed to the test process for execution.
  - On receiving the test to execute, the child process locates and runs any beforeEach hooks, then runs the test, and finally runs any afterEach hooks in the scope of the test.
  - Lastly the results of the execution are packaged and sent back to the parent mocha process.
  - When mocha is finished, or when a new source file is encountered, the child process runs the after hooks and exits.
- Mocha receives either a success, or the exception information and reports it. 

## Mocha hooks

Because we are executing the hooks manually due to technical reasons, we are unable to run the hooks at the same time mocha calls the `run` method of each hook. While this ensures that all appropriate hooks registered within a source file are executed, it also causes some issues with regards to reporting. Currently all hook errors are being reported as test failures since Mocha is unable to tell where the actual exception occurred.

### Before and After
While we ensure that all registered before/after hooks are called either before or after the test, we do not yet concern ourselves with scope, thus all before methods are executed at one time (startup) and all after methods will be executed at one time (shutdown) regardless of where they are defined. For the before hook, outer-most declarations are guaranteed to be executed first. The inverse is also true for the after hooks.

### BeforeEach and AfterEach
We take care to ensure that registered beforeEach and afterEach hooks are executed prior to and after each test. The order of execution, and which ones, run should be no different from that of Mocha. The only difference will be the aforementioned reporting of failures.

# More Information

- github: https://github.com/now-ims/mocha-isolation
- author: https://github.com/roknow

## License

[MIT Licence](https://github.com/now-ims/mocha-isolation/blob/master/LICENSE)
Copyright (c) 2018