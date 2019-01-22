import {printInfo} from '../print';
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
import {addReadme} from '../resources/readme';
import {addNpxScripts} from '../resources/npx';
import {addBabelConfig} from '../resources/babel';


const taskFunctions = {
  initSourceControlManager: initializeSourceControlManager,
  initPackageManager: initializePackageManager,
  initCommitStandard: initializeCommitStandard,
  initGlobalBackend: installBackendGlobally,
  initBackendManager: initializeBackendManager,
  initMultienvManager: initializeMultiEnvManager,
  installNpx: installNpxAndTools,
  installBabelDeps: installBabelDependencies,
  addResourceNpxScripts: addNpxScripts,
  addResourceReadme: addReadme,
  addResourceBabelConfig: addBabelConfig
};

export const runTasks = async (tasks)=> {
  for (const task of tasks) {
    // eslint-disable-next-line
    printInfo(`\n------ ${task.description} ------\n`, true);
    await taskFunctions[task.type](...task.args);
  }
};
