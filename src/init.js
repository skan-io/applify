import fs from 'fs';
import {join} from 'path';
import Store from './store';
import defaultConfig from './default.config';
import {importPlugin} from './plugins/import';
import {createApplifyDirTask} from './plugins/preloader';
import {
  STORE_INIT,
  STORE_OPERATOR_SETUP,
  STORE_MANAGER_SETUP,
  STORE_PRELOADED
} from './events';
import {newLine} from './print';


const resetTempFiles = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Reset applify temp files',
    children: [
      createApplifyDirTask(store),
      {
        type: 'task',
        description: `clear ${store.applifyTempFile}`,
        task: ()=> {
          try {
            fs.writeFileSync(store.applifyTempFile, JSON.stringify({}));

            return {
              printInfo: `Reset ${store.applifyTempFile}`,
              printSuccess: `Reset ${store.applifyTempFile} to {}`
            };
          } catch (err) {
            return {
              printError: err
            };
          }
        }
      }
    ]
  });

  await store.runTasks();
};

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

// Initialise all the plugins required by operators and steps
// eslint-disable-next-line
const init = async ({devMode, reset, useConfig}, customStore, customConfig)=> {
  // Can pass a custom store class/object in also
  const store = customStore ? customStore : new Store();

  if (!store.applifyDir) {
    store.applifyDir = join(process.cwd(), '.applify');
  }
  if (!store.applifyTempFile) {
    store.applifyTempFile = join(store.applifyDir, 'temp.json');
  }

  // Get config
  // TODO get config from elsewhere
  const config = customConfig ? customConfig : defaultConfig();

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
    await initialiseStorePlugins(store, config);
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

  // Run the initialisation tasks and run the initialisation question
  await store.runTasks();

  newLine();

  await store.runQuestions();

  // console.log({store});
};

export default init;