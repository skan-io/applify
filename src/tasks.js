import chalk from 'chalk';
import {initializePackageManager} from './package-manager';
import {initializeBackendManager} from './backend-manager';
import {initializeSourceControl} from './source-control';
import {initializeReadme} from './readme';


const taskFunctions = {
  initPackageManager: initializePackageManager,
  initReadme: initializeReadme,
  initSourceControl: initializeSourceControl,
  initAmplify: initializeBackendManager
};

export const runTasks = async (tasks)=> {
  for (const task of tasks) {
    // eslint-disable-next-line
    console.log(chalk.blue(`------ ${task.description.toUpperCase()} ------`));
    await taskFunctions[task.type](...task.args);
  }
};
