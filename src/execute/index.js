import {exec, spawn as shellSpawn} from 'child_process';
import {onExit} from '@rauschma/stringio';
import {printInfo, printSuccess, printError} from '../print';
import {EXECUTION_ERROR} from '../error/error-codes';
import {applifyError} from '../error';


/**
 * Execute a command within shell the of the main process
 * @param  {String}  cmd Command to be executed
 * @return {Promise}     If command success resolved or rejected if failed
 */
export const shellExec = async (cmd)=> new Promise((resolve, reject)=> {
  exec(cmd, (err, stdout, stderr)=> {
    if (err) {
      reject(err);
    } else {
      resolve({stdout, stderr});
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
export const execute = async ({cmd, info}, throwOnError=true)=> {
  try {
    if (global.log) {
      printInfo(info);
    }

    const result = await shellExec(cmd);

    if (global.log) {
      printSuccess(result.stdout);
    }

    printError(result.stderr);
  } catch (err) {
    printError(err);

    if (throwOnError) {
      throw applifyError(
        EXECUTION_ERROR.code,
        `${EXECUTION_ERROR.message}: ${info} failed with commande ${cmd}`
      );
    }
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
export const spawn = async (
  {cmd, args, info}, stdio=[process.stdin, process.stdout, process.stderr]
)=> {
  if (global.log) {
    printInfo(info);
  }

  const childProcess = shellSpawn(cmd, args, {stdio});

  if (childProcess.stdout && global.log) {
    childProcess.stdout.on('data', (data)=> {
      printSuccess(data);
    });
  }

  if (childProcess.stderr && global.log) {
    childProcess.stdout.on('data', (data)=> {
      printError(data);
    });
  }

  // TODO improve to watch for failed exits
  await onExit(childProcess);
};
