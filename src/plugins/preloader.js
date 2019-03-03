import fs from 'fs';
import {stringify} from '../utils/strings';


const eventKeys = new Set(['_events', '_eventsCount', '_maxListeners']);
const operators = new Set(['preloader', 'tasker', 'prompter']);


const preloadStoreFromTemp = (file, store)=> {
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));

  for (const key of Reflect.ownKeys(json)) {
    if (!eventKeys.has(key) && !operators.has(key)) {
      store[key] = json[key];
      store.preloaded = true;
    }
  }

  return {
    steps: json.completedSteps,
    answers: stringify(json.answers)
  };
};


export const createApplifyDirTask = (store)=> {
  const {applifyDir} = store;

  return ({
    type: 'task',
    description: `find or create local applify directory (${applifyDir})`,
    task: (storeCtx)=> {
      try {
        let printSuccess = `Found ${applifyDir}`;

        if (!storeCtx.applifyDirFound && !fs.existsSync(applifyDir)) {
          fs.mkdirSync(applifyDir);
          printSuccess = `Created ${applifyDir}`;
        }

        storeCtx.applifyDirFound = true;

        return {
          printInfo: `Find or create local applify directory`,
          printSuccess
        };
      } catch (err) {
        return {printError: err};
      }
    }
  });
};

export const createApplifyTempFileTask = (store)=> {
  const {applifyTempFile} = store;

  return ({
    type: 'task',
    description: `find or create applify temp file (${applifyTempFile})`,
    task: (storeCtx)=> {
      try {
        let printSuccess = `Found ${applifyTempFile}`;
        let printWarning = null;

        if (storeCtx.applifyDirFound || fs.existsSync(applifyTempFile)) {
          // eslint-disable-next-line
          console.log('Restoring from previous applify init');
          const {steps, answers} = preloadStoreFromTemp(
            applifyTempFile, storeCtx
          );
          // eslint-disable-next-line
          printWarning = `USING PREVIOUS STORE:\n DATA: ${answers} \n COMPLETE STEPS: ${steps}`
        } else {
          printSuccess = `Using fresh ${applifyTempFile}`;
        }

        return {
          printInfo: `Find or create applify temp.json file`,
          printSuccess,
          printWarning
        };
      } catch (err) {
        return {printError: err};
      }
    }
  });
};


export const init = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Checking for previous applify configuration',
    children: [
      createApplifyDirTask(store),
      createApplifyTempFileTask(store)
    ]
  });

  await store.runTasks();
};
