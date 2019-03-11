import {join} from 'path';
import Store from './store';
import defaultConfig from './default.config';
import {importPlugin} from './plugins/import';
import {
  STORE_INIT,
  STORE_OPERATOR_SETUP,
  STORE_MANAGER_SETUP,
  STORE_PRELOADED,
  STORE_RUN
} from './events';
import {printInfo} from './print';
import {resetTempFiles} from './reset';


// Set up the operators
// Operators are the core functionality of applify
const setupStoreOperatorPlugins = async (store, config)=> {
  const operators = ['preloader', 'tasker', 'prompter'];

  store.step = 'setup-operators';

  // Initialise the operator plugins
  for (const operator of operators) {
    const operatorPlugin = await importPlugin(store, config, operator);
    // Assign the operator in the store
    store.set(operator, operatorPlugin);
  }

  store.emit(STORE_OPERATOR_SETUP);
};

// Set up managers
// Manager are the pluggable/customisable functionality of applify
const setupStoreManagerPlugins = async (store, config)=> {
  store.step = 'setup-managers';

  for (const step of config.steps) {
    await importPlugin(store, config, step);
  }

  store.emit(STORE_MANAGER_SETUP);
};

const preloadStore = async (store)=> {
  store.step = 'preload';

  // Do initial check for temp files and config files etc..
  await store.preloader.init(store);

  store.emit(STORE_PRELOADED);
};

const initialiseStorePlugins = async (store, config)=> {
  store.step = 'init';

  // Initialise the manager plugins (manager for each step)
  for (const step of config.steps) {
    // Initialise plugin
    await store[step].init(store, config);
    store.updateTempStore();
  }

  store.emit(STORE_INIT);

  // First data driven step, all steps from here on are reported
  // as `completeSteps`, which are stored in .applify/temp.json
  store.completedSteps.push('init');
};

const getSteps = (store, steps)=> {
  for (const step of store.completedSteps) {
    // We don't care about intermediary steps
    // e.g. init:project or init:source
    if (step.includes(':')) {
      // eslint-disable-next-line
      continue;
    } else if (step === steps[0]) {
      steps = steps.slice(1);
    } else {
      break;
    }
  }

  return steps;
};

// eslint-disable-next-line
const setFilePaths = (store)=> {
  if (!store.workingDir) {
    store.workingDir = process.cwd();
  }
  if (!store.applifyDir) {
    store.applifyDir = join(process.cwd(), '.applify');
  }
  if (!store.applifyTempFile) {
    store.applifyTempFile = join(store.applifyDir, 'temp.json');
  }
  if (!store.packageJsonFile) {
    store.packageJsonFile = join(process.cwd(), 'package.json');
  }
  if (!store.runScriptsDir) {
    store.runScriptsDir = join(process.cwd(), 'scripts');
  }
  if (!store.runScriptsLibsDir) {
    store.runScriptsLibsDir = join(process.cwd(), 'scripts', 'lib');
  }
  if (!store.appSrcDir) {
    store.appSrcDir = join(process.cwd(), 'src');
  }
};

// Initialise all the plugins required by operators and steps
// eslint-disable-next-line
const init = async ({devMode, reset, useConfig}, customStore, customConfig)=> {
  // Can pass a custom store class/object in also
  const store = customStore ? customStore : new Store();
  store.answers = {};

  setFilePaths(store);

  // Get config
  // TODO get config from elsewhere
  const config = customConfig
    // Use parts from the default config if not found in customConfig
    ? {...defaultConfig(), ...customConfig}
    : defaultConfig();

  // Setup the store operators
  await setupStoreOperatorPlugins(store, config);

  // Default set of steps
  let steps = ['init', ...config.steps];

  // COMPULSORY STEPS...

  // If reset clear the .applify/temp.json
  if (reset) {
    await resetTempFiles(store);
  } else {
    // Try to load the saved state from the last applify attempt
    await preloadStore(store);
  }

  await setupStoreManagerPlugins(store, config);

  // NON-COMPULSORY STEPS...

  // If it was preloaded find out what step we are up to
  if (store.preloaded) {
    steps = getSteps(store, steps);
  }

  // Here any init tasks that want to delay some tasks can react
  // to the store 'init' event and then run some tasks

  // If we still need to initialise the store
  if (steps[0] === 'init') {
    await initialiseStorePlugins(store, config, false);
    // Get the left over steps
    steps = steps.slice(1);
    store.updateTempStore();
  }

  // Check that for each already completed (restored) plugin that the required
  // init data is there, otherwise re-run the init functionality
  if (store.preloaded) {
    for (const step of steps) {
      if (step !== 'init') {
        await store[step].checkRestore(store, config);
      }
    }
  }

  printInfo('\n-------- PROJECT SETUP ---------\n');

  const runPromises = [];

  const sourcePromiseFunc = await store['source'].run(store);
  const projectPromiseFunc = await store['project'].run(store);
  const packagePromiseFunc = await store['package'].run(store);
  const languagePromiseFunc = await store['language'].run(store);
  const buildPromiseFunc = await store['build'].run(store);
  const testPromiseFunc = await store['test'].run(store);
  const stylePromiseFunc = await store['style'].run(store);
  const deployPromiseFunc = await store['deploy'].run(store);

  runPromises.push(
    projectPromiseFunc(),
    sourcePromiseFunc(),
    packagePromiseFunc(),
    languagePromiseFunc(),
    buildPromiseFunc(),
    testPromiseFunc(),
    stylePromiseFunc(),
    deployPromiseFunc()
  );

  await store.runTasks();

  store.emit(STORE_RUN);

  await Promise.all(runPromises);

  // Run each step
  // for (const step of steps) {
  //   // If the run phase was not complete run it again
  //   if (!store.completeSteps.some(
  //     (completed)=> completed === `run:${step}`)
  //   ) {
  //     await store[step].run(store, config);
  //   }
  // }
};

export default init;
