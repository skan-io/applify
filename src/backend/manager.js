import {spawn} from 'child_process';
import chalk from 'chalk';
import {onExit} from '@rauschma/stringio';
import {shellExec} from '../exec';
import {createAmplifyInitScriptWithEnv} from '../utils';


/* eslint no-console: 0 */

// eslint-disable-next-line
export const initializeBackendManager = async (env)=> {
  const initScriptPath = createAmplifyInitScriptWithEnv(env);

  const childProcess = spawn(initScriptPath, [],
    {stdio: [process.stdin, process.stdout, process.stderr]});

  await onExit(childProcess);
};


export const installBackendGlobally = async ()=> {
  let result = null;

  console.log();
  console.log(chalk.yellow('...please wait. This may take a few minutes...'));

  try {
    result = await shellExec(
      `npm install -g @aws-amplify/cli@multienv`
    );

    console.log(chalk.red(result.stderr));
    console.log(chalk.green(result.stdout));
  } catch (err) {
    console.log(chalk.red(err));
  }
};
