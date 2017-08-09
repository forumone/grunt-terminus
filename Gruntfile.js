'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    eslint: {
      options: {
        configFile: '.eslintrc.js',
      },
      target: ['./*.js', './tasks', './lib', './test'],
    },
  });

  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-eslint');

  grunt.registerTask('default', ['eslint']);
};
