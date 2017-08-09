# grunt-terminus

> Runs Terminus commands on the Pantheon environment

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-terminus --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-terminus');
```

## The "terminus" task

### Overview
```js
require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

grunt.initConfig({
  terminus: {
    options: {
      machine_key: '`machine_key`'
    },
    createBackup: {
      command: 'backup:create `name`'
    },
    envWake: 'env:wake `name`' // shorthand
  }
});

grunt.registerTask('default', ['terminus']);
```

## Usage Examples

## Config

### command

*Required*<br>
Type: `string` `Function`

Command to run or a function which returns the command. Supports underscore templates.

*Command can be omitted by directly setting the target with the command.*


## Options

### machine_token

Type: `string`

Machine token used to connect to Pantheon. If `machine_token` is provided Terminus will run `auth:login` before running any commands.

### organization
Type: `string`

Organization ID (UUID) used to interact with Pantheon.

### execOptions

Type: `Object`

Specify some options to be passed to the [.exec()](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback) method:

- `cwd` string *Current working directory of the child process*
- `env` Object *Environment key-value pairs*
- `setsid` boolean
- `encoding` string *(Default: `'utf8'`)*
- `timeout` number *(Default: `0`)*
- `maxBuffer` number *(Default: `1000 * 1000 * 10` → 10 MB)*
- `killSignal` string *(Default: `'SIGTERM'`)*

## Release History
_(Nothing yet)_
