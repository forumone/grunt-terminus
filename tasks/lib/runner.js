

const exec = require('child-process-promise').exec;
const Promise = require('bluebird');
const retry = require('bluebird-retry');
const spawn = require('child_process').spawn;
const pad = require('pad-number');

module.exports = function (grunt, machine_token, opts) {
  const token = machine_token;
  const options = Object.assign({
    timeout: 0,
  }, opts);

  /**
   * Executes a dry run of the commands
   */
  const dryRunCommand = function (command) {
    return Promise.delay(500)
    .then(() => ({
      result: {},
      command,
    }));
  };

  /**
   * Runs a potentially interactive Terminus command.
   *
   * Due to how Terminus executes these commands it is necessary to
   * spawn a new process and then watch it for either specific success
   * text or specific error text in addition to normal process exit.
   */
  const interactiveCommand = function (params) {
    const command = `terminus ${params.join(' ')}`;
    const debugParams = params;
    debugParams.push('-d');

    let completed = false;
    const promise = new Promise((resolve, reject) => {
      // Run command interactively
      const child = spawn('terminus', params, {
        stdio: [
          // create pipes for stdin and stdout
          'pipe',
          'pipe',
          // but dump stderr to the process error
          'pipe',
        ],
      });

      // Assume we're receiving utf-8 text
      child.stdout.setEncoding('utf-8');

      // This assumes that bash will flush output on every process exit
      // so we're probably okay looking for the magic string "done"
      child.stdout.on('data', (chunk) => {
        if (chunk.indexOf('Command dispatch complete') !== -1) {
          // Calling end() on a stream will cause node to close it, which is how bash knows to close up shop
          // Comment out this line and watch node hang
          child.stdin.end();
          if (!completed) {
            completed = true;
            resolve({
              command,
              result: {},
            });
          }
        } else if (chunk.indexOf('[error]') !== -1) {
          // Calling end() on a stream will cause node to close it, which is how bash knows to close up shop
          // Comment out this line and watch node hang
          child.stdin.end();

          if (!completed) {
            completed = true;
            reject({
              command,
              result: {},
            });
          }
        }
      });

      // The 'close' event is different from the 'exit' event.
      // I'd probably listen for this one since it's definitively when the child process ended.
      child.on('exit', (code) => {
        if (!completed) {
          completed = true;
          if (code === 0) {
            resolve({
              command,
              result: {},
            });
          } else {
            reject({
              command,
              error: {},
            });
          }
        }
      });
    });

    return promise;
  };

  /**
   * Runs a non-interactive Terminus command using NodeJS exec calls
   */
  const nonInteractiveCommand = function (cmd) {
    const command = `terminus ${cmd}`;

    return exec(command, options)
    .then(result => ({
      result,
      command,
    }))
    .catch(err => Promise.reject({
      error: err,
      command,
    }));
  };

  /**
   * Runs a full Terminus command
   */
  const run = function (cmd, dryRun) {
    const command = (Array.isArray(cmd)) ? `terminus ${cmd.join(' ')}` : `terminus ${cmd}`;
    const start = new Date().getTime();

    return retry(() => {
      let promise;

      if (dryRun) {
        promise = dryRunCommand(command);
      } else if (Array.isArray(cmd)) {
        promise = interactiveCommand(cmd);
      } else {
        promise = nonInteractiveCommand(cmd);
      }

      if (dryRun) {
        grunt.verbose.ok(`Debug: '${command}'`);
      } else {
        grunt.verbose.ok(`Running: '${command}'`);
      }

      return promise;
    }, {
      throw_original: true,
    })
    .then((result) => {
      const stop = new Date().getTime();

      grunt.verbose.ok(`Success: '${command}' (${formatTime(stop - start)})`);
      return result;
    })
    .catch((err) => {
      grunt.verbose.error(`Failed: '${command}'`);
      const originalError = JSON.parse(err.failure.failure);
      return Promise.reject(originalError);
    });
  };

  /**
   * Formats time to hh:MM:ss
   */
  const formatTime = function (millisec) {
    const ms = (millisec % 1000).toFixed(0);
    const seconds = Math.floor((millisec / 1000).toFixed(0) % 60);
    const minutes = Math.floor(seconds / 60);

    return `${pad(minutes, 2)}:${pad(seconds, 2)}.${pad(ms, 3)}`;
  };

  const funcs = {
    run,
  };

  return run(`auth:login --machine-token=${token}`)
  .then(() => funcs)
  .catch(err => Promise.reject({
    log: [`Error: failed to connect to Pantheon: (${err.command})`],
    school: '',
  }));
};
