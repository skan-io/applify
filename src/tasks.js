import chalk from 'chalk';
import {initializePackageManager} from './package-manager';
import {
  initializeBackendManager,
  installBackendGlobally
} from './backend-manager';
import {initializeSourceControlManager} from './source-manager';
import {initializeMultiEnvManager} from './multienv-manager';
import {initializeReadme} from './readme';


const taskFunctions = {
  initPackageManager: initializePackageManager,
  initSourceControlManager: initializeSourceControlManager,
  initBackendManager: initializeBackendManager,
  initMultienvManager: initializeMultiEnvManager,
  initGlobalBackend: installBackendGlobally,
  initReadme: initializeReadme
};

export const runTasks = async (tasks)=> {
  for (const task of tasks) {
    // eslint-disable-next-line
    console.log(chalk.blue(`------ ${task.description.toUpperCase()} ------`));
    await taskFunctions[task.type](...task.args);
  }
};
