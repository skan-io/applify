"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = require("path");

var _store = _interopRequireDefault(require("./store"));

var _default2 = _interopRequireDefault(require("./default.config"));

var _import = require("./plugins/import");

var _events = require("./events");

var _print = require("./print");

var _reset = require("./reset");

// Set up the operators
// Operators are the core functionality of applify
const setupStoreOperatorPlugins = async (store, config) => {
  const operators = ['preloader', 'tasker', 'prompter'];
  store.step = 'setup-operators'; // Initialise the operator plugins

  for (const operator of operators) {
    const operatorPlugin = await (0, _import.importPlugin)(store, config, operator); // Assign the operator in the store

    store.set(operator, operatorPlugin);
  }

  store.emit(_events.STORE_OPERATOR_SETUP);
}; // Set up managers
// Manager are the pluggable/customisable functionality of applify


const setupStoreManagerPlugins = async (store, config) => {
  store.step = 'setup-managers';

  for (const step of config.steps) {
    await (0, _import.importPlugin)(store, config, step);
  }

  store.emit(_events.STORE_MANAGER_SETUP);
};

const preloadStore = async store => {
  store.step = 'preload'; // Do initial check for temp files and config files etc..

  await store.preloader.init(store);
  store.emit(_events.STORE_PRELOADED);
};

const initialiseStorePlugins = async (store, config) => {
  store.step = 'init'; // Initialise the manager plugins (manager for each step)

  for (const step of config.steps) {
    // Initialise plugin
    await store[step].init(store, config);
    store.updateTempStore();
  }

  store.emit(_events.STORE_INIT); // First data driven step, all steps from here on are reported
  // as `completeSteps`, which are stored in .applify/temp.json

  store.completedSteps.push('init');
};

const getSteps = (store, steps) => {
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
}; // eslint-disable-next-line


const setFilePaths = store => {
  if (!store.workingDir) {
    store.workingDir = process.cwd();
  }

  if (!store.applifyDir) {
    store.applifyDir = (0, _path.join)(process.cwd(), '.applify');
  }

  if (!store.applifyTempFile) {
    store.applifyTempFile = (0, _path.join)(store.applifyDir, 'temp.json');
  }

  if (!store.packageJsonFile) {
    store.packageJsonFile = (0, _path.join)(process.cwd(), 'package.json');
  }

  if (!store.runScriptsDir) {
    store.runScriptsDir = (0, _path.join)(process.cwd(), 'scripts');
  }

  if (!store.runScriptsLibsDir) {
    store.runScriptsLibsDir = (0, _path.join)(process.cwd(), 'scripts', 'lib');
  }

  if (!store.appSrcDir) {
    store.appSrcDir = (0, _path.join)(process.cwd(), 'src');
  }
}; // Initialise all the plugins required by operators and steps
// eslint-disable-next-line


const init = async ({
  devMode,
  reset,
  useConfig
}, customStore, customConfig) => {
  // Can pass a custom store class/object in also
  const store = customStore ? customStore : new _store.default();
  store.answers = {};
  setFilePaths(store); // Get config
  // TODO get config from elsewhere

  const config = customConfig // Use parts from the default config if not found in customConfig
  ? { ...(0, _default2.default)(),
    ...customConfig
  } : (0, _default2.default)(); // Setup the store operators

  await setupStoreOperatorPlugins(store, config); // Default set of steps

  let steps = ['init', ...config.steps]; // COMPULSORY STEPS...
  // If reset clear the .applify/temp.json

  if (reset) {
    await (0, _reset.resetTempFiles)(store);
  } else {
    // Try to load the saved state from the last applify attempt
    await preloadStore(store);
  }

  await setupStoreManagerPlugins(store, config); // NON-COMPULSORY STEPS...
  // If it was preloaded find out what step we are up to

  if (store.preloaded) {
    steps = getSteps(store, steps);
  } // Here any init tasks that want to delay some tasks can react
  // to the store 'init' event and then run some tasks
  // If we still need to initialise the store


  if (steps[0] === 'init') {
    await initialiseStorePlugins(store, config, false); // Get the left over steps

    steps = steps.slice(1);
    store.updateTempStore();
  } // Check that for each already completed (restored) plugin that the required
  // init data is there, otherwise re-run the init functionality


  if (store.preloaded) {
    for (const step of steps) {
      if (step !== 'init') {
        await store[step].checkRestore(store, config);
      }
    }
  }

  (0, _print.printInfo)('\n-------- PROJECT SETUP ---------\n');
  const runPromises = [];
  const sourcePromiseFunc = await store['source'].run(store);
  const projectPromiseFunc = await store['project'].run(store);
  const packagePromiseFunc = await store['package'].run(store);
  const languagePromiseFunc = await store['language'].run(store);
  const buildPromiseFunc = await store['build'].run(store);
  const testPromiseFunc = await store['test'].run(store);
  const stylePromiseFunc = await store['style'].run(store);
  const deployPromiseFunc = await store['deploy'].run(store);
  runPromises.push(projectPromiseFunc(), sourcePromiseFunc(), packagePromiseFunc(), languagePromiseFunc(), buildPromiseFunc(), testPromiseFunc(), stylePromiseFunc(), deployPromiseFunc());
  await store.runTasks();
  store.emit(_events.STORE_RUN);
  await Promise.all(runPromises); // Run each step
  // for (const step of steps) {
  //   // If the run phase was not complete run it again
  //   if (!store.completeSteps.some(
  //     (completed)=> completed === `run:${step}`)
  //   ) {
  //     await store[step].run(store, config);
  //   }
  // }
};

var _default = init;
exports.default = _default;