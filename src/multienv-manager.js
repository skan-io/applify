import chalk from 'chalk';
import {
  initializeSourceControlManager,
  sourceControlPush
} from './source-manager';
import {initializeBackendManager} from './backend-manager';
import {shellExec} from './exec';


/* eslint no-console: 0 */


// eslint-disable-next-line
export const initializeMultiEnvManager = async (projectName, repoOwner)=> {
  const envs = ['master', 'test', 'dev'];

  for (let i = 0; i < envs.length; i += 1) {
    await initializeSourceControlManager(
      projectName, repoOwner, envs[i], i === 0
    );
    await initializeBackendManager(envs[i]);

    if (i !== envs.length - 1) {
      try {
        const result = await shellExec(`git checkout -b ${envs[i + 1]}`);
        console.log(chalk.green(result.stdout));
        console.log(chalk.red(result.stderr));
      } catch (err) {
        console.log(chalk(err));
      }
    }
  }

  for (const env of envs) {
    await sourceControlPush(
      env, 'chore', 'tooling', 'Added initial amplify code', [], true
    );
  }
};
