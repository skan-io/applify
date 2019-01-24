import ora from 'ora';
import {printInfo, printError} from '../print';
import {initializePackageManager} from '../package/manager';
import {initializeMultiEnvManager} from '../multienv/manager';
import {
  initializeSourceControlManager,
  initializeCommitStandard
} from '../source/manager';
import {
  initializeBackendManager,
  installBackendGlobally
} from '../backend/manager';
import {installNpxAndTools} from '../tooling/npx';
import {installBabelDependencies} from '../bundle/babel';
import {installWebpackDependencies} from '../bundle/webpack';
import {addReadme} from '../resources/readme';
import {addNpxScripts} from '../resources/npx';
import {addBabelConfig} from '../resources/babel';


const taskFunctions = {
  // Initialization
  initSourceControlManager: initializeSourceControlManager,
  initPackageManager: initializePackageManager,
  initCommitStandard: initializeCommitStandard,

  // Installers
  installNpx: installNpxAndTools,
  installBabelDeps: installBabelDependencies,
  installWebpackDeps: installWebpackDependencies,

  // Resource providers
  addResourceNpxScripts: addNpxScripts,
  addResourceReadme: addReadme,
  addResourceBabelConfig: addBabelConfig
};

// eslint-disable-next-line max-statements
export const runTasks = async (tasks)=> {
  const oraSpinner = ora();
  const log = global.log;

  for (const task of tasks) {
    if (log) {
      printInfo(`\n------ ${task.description} ------\n`, true);
    } else {
      oraSpinner.start(task.description);
    }

    try {
      await taskFunctions[task.type](...task.args);

      if (!log) {
        oraSpinner.succeed();
      }
    } catch (err) {
      if (!log) {
        oraSpinner.fail();
      }

      printError(err);

      throw new Error(err);
    }
  }
};
