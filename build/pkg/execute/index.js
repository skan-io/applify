"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.spawn = exports.execute = exports.shellExec = void 0;

var _child_process = require("child_process");

var _stringio = require("@rauschma/stringio");

var _print = require("../print");

var _errorCodes = require("../error/error-codes");

var _error = require("../error");

/**
 * Execute a command within shell the of the main process
 * @param  {String}  cmd Command to be executed
 * @return {Promise}     If command success resolved or rejected if failed
 */
const shellExec = async cmd => new Promise((resolve, reject) => {
  (0, _child_process.exec)(cmd, (err, stdout, stderr) => {
    if (err) {
      reject(err);
    } else {
      resolve({
        stdout,
        stderr
      });
    }
  });
});
/**
 * Execute a simple shell command
 *
 * example:
 * ```js
 * const command = {cmd: 'npm init', info: 'Initialises npm'};
 * await execute(command);
 * ```
 *
 * @param  {Object}  command              Object containing command
 * @param  {String}  command.cmd          Command to be executed
 * @param  {String}  command.info         Command details
 * @param  {Boolean} [throwOnError=true]  If true will throw on error
 * @return {Promise}                      When resolved the command will
 *                                        have been executed
 */
// eslint-disable-next-line max-statements


exports.shellExec = shellExec;

const execute = async ({
  cmd,
  info
}, throwOnError = true) => {
  try {
    const result = await shellExec(cmd);
    return {
      result,
      printInfo: info,
      printSuccess: result.stdout,
      printError: result.stderr
    };
  } catch (err) {
    if (throwOnError) {
      throw (0, _error.applifyError)(_errorCodes.EXECUTION_ERROR.code, `${_errorCodes.EXECUTION_ERROR.message}: ${info} failed with command ${cmd}`);
    }

    return {
      printError: err
    };
  }
};
/**
 * Execute an interactive command or script
 *
 * example:
 * ```js
 * const command = {cmd: 'applify', args: ['init'], info: 'Initialises npm'};
 * await spawn(command);
 * ```
 *
 * @param  {Object}  command                Object containing command
 * @param  {String}  command.cmd            Command to be executed
 * @param  {String}  command.info           Command details
 * @param  {Array.<String>}  command.args   Command arguments
 * @param  {Array.<Object>} [stdio=[
 *                                  process.stdin,
 *                                  process.stdout,
 *                                  process.stderr
 *                                  ]
 *                           ] IO to be used by the child process
 * @return {Promise}  Resolved when child process exits
 */
// eslint-disable-next-line max-statements


exports.execute = execute;

const spawn = async ({
  cmd,
  args,
  info
}, throwOnError = true, stdio = [process.stdin, process.stdout, process.stderr]) => {
  // TODO make conform to task printing
  if (global.log) {
    (0, _print.printInfo)(info);
  }

  try {
    const childProcess = (0, _child_process.spawn)(cmd, args, {
      stdio
    });

    if (childProcess.stdout && global.log) {
      childProcess.stdout.on('data', data => {
        (0, _print.printSuccess)(data);
      });
    }

    if (childProcess.stderr && global.log) {
      childProcess.stdout.on('data', data => {
        (0, _print.printError)(data);
      });
    } // TODO improve to watch for failed exits


    await (0, _stringio.onExit)(childProcess);
  } catch (err) {
    if (throwOnError) {
      throw (0, _error.applifyError)(_errorCodes.EXECUTION_ERROR.code, `${_errorCodes.EXECUTION_ERROR.message}: ${info} failed with command ${cmd}`);
    }

    return {
      printError: err
    };
  }
};

exports.spawn = spawn;