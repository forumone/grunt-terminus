/*
 * grunt-terminus
 * https://github.com/forumone/grunt-terminus
 *
 * Copyright (c) 2017 William Hurley
 * Licensed under the MIT license.
 */

'use strict';

// Merge task-specific and/or target-specific options with these defaults.
const defaultOptions = {
  machine_token: '',
  path: '',
  execOptions: {
    env: null,
  },
};

module.exports = function (grunt) {
  const getRunner =  function (machine_token, execOptions) {
    const runner = require('./lib/runner');
    return runner(grunt, machine_token, execOptions);
  };

  /**
   * Multi-task to execute arbitrary Terminus commands
   */
  grunt.registerMultiTask('terminus', 'Runs Terminus commands on the Pantheon environment', function () {
    // Merge task-specific and/or target-specific options with these defaults.
    const options = this.options(defaultOptions);
    const done = this.async();

    let cmd = typeof this.data === 'string' ? this.data : this.data.command;

    if (cmd === undefined) {
      throw new Error('`command` required');
    }

    cmd = grunt.template.process(typeof cmd === 'function' ? cmd.apply(grunt, arguments) : cmd);
    options.execOptions = Object.assign({}, options.execOptions);

    let runner;

    getRunner(options.machine_token, options.execOptions)
    .then((obj) => {
      runner = obj;

      return runner.run(cmd, options.execOptions);
    })
    .then((result) => {
      grunt.log.write(result.stdout);
      done();
    })
    .catch((err) => {
      grunt.log.error(err);
      done(false);
    });
  });

  return {
    getRunner,
  };
};
