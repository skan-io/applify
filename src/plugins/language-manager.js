import {STEP_COMPLETE} from '../events';
import {printInfo, printWarning} from '../print';
import {expectDefined} from './utils';


const getBabelDetails = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Node target: ',
      'input',
      'nodeTarget',
      store.answers.nodeTarget || 'current'
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Browser targets (comma seperated): ',
      'input',
      'browserTargets',
      store.answers.browserTargets || ['last 2 versions', 'not IE < 11']
    )
  );
  
  store.addQuestion(
    store.prompter.createQuestion(
      'Would you like to add extra babel plugins: ',
      'input',
      'babelPlugins',
      store.answers.babelPlugins || 'none'
    )
  );

  printInfo('\n-------- LANGUAGE DETAILS ---------\n');
  await store.runQuestions();
};

const runBabelInstallTasks = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Install babel dependencies',
    children: [
      {
        type: 'task',
        description: 'install skan-io babel config',
        task: async (storeCtx)=> {
          if (!storeCtx.babelInstalled) {
            const output = await storeCtx.packageInstaller.install(
              '@skan-io/babel-config-nodejs'
            );

            storeCtx.babelInstalled = true;

            return output;
          }

          return {};
        }
      }
    ]
  });

  await store.runTasks();
};


export const checkRestore = async (store)=> {
  const data = ['babelInstalled'];
  let restoreSuccess = true;

  for (const field of data) {
    if (!expectDefined(store[field])) {
      printWarning(
        `Package plugin required ${field} to be defined - reinitialising...`
      );

      restoreSuccess = false;
    }
  }

  if (!restoreSuccess) {
    // eslint-disable-next-line
    await init(store);
  }
};


export const init = async (store)=> {
  if (store.completedSteps.some((step)=> step === 'init:language')) {
    await checkRestore(store);
  } else {

    await getBabelDetails(store);
    await runBabelInstallTasks(store);

    store.emit(STEP_COMPLETE, 'init:language');
    store.completedSteps.push('init:language');
  }
};

// TODO run - create babel config based on whether there is testing, webpack and targets
