import chalk from 'chalk';
import {initializePackageManager} from './package-manager';
import {initializeReadme} from './readme';
import {initializeSourceControl} from './source-control';


const taskFunctions = {
  initPackageManager: initializePackageManager,
  initReadme: initializeReadme,
  initSourceControl: initializeSourceControl
};

export const runTasks = async (tasks)=> {
  for (const task of tasks) {
    // eslint-disable-next-line
    console.log(chalk.blue(`------ ${task.description.toUpperCase()} ------`));
    await taskFunctions[task.type](...task.args);
  }
};
