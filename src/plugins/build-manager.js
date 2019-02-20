import {STEP_COMPLETE} from '../events';
import {printInfo, printWarning, printDim} from '../print';
import {expectDefined} from './utils';


const getBuildDetails = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Entry points (module names): ',
      'input',
      'buildEntries',
      store.answers.buildEntries || ['index.html.js']
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Output directory: ',
      'input',
      'buildOutputPath',
      store.answers.buildOutputPath || ['build/pkg']
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Development server port: ',
      'input',
      'devServerPort',
      store.answers.devServerPort || '8080'
    )
  );
  
  store.addQuestion(
    store.prompter.createQuestion(
      'Favicon url: ',
      'input',
      'faviconUrl',
      store.answers.faviconUrl || ['favicon.png']
    )
  );

  printInfo('\n-------- BUILD DETAILS ---------\n');
  await store.runQuestions();
};

const runWebpackSetupTasks = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Install webpack dependencies',
    children: [
      {
        type: 'task',
        description: 'install skan-io webpack config ',
        task: async (storeCtx)=> {
          if (!storeCtx.webpackInstalled) {
            const output = await storeCtx.packageInstaller.install(
              '@skan-io/webpack-config-base'
            );

            storeCtx.webpackInstalled = true;

            return output;
          }

          return {};
        }
      }
    ]
  });

  await store.runTasks();
};

// eslint-disable-next-line max-statements
export const checkRestore = async (store)=> {
  const answers = [
    {question: 'Entry points (module names): ', field: 'buildEntries'},
    {question: 'Output directory: ', field: 'buildOutputPath'},
    {question: 'Development server port: ', field: 'devServerPort'},
    {question: 'Favicon url: ', field: 'faviconUrl'}
  ];
  const data = ['webpackInstalled'];
  let restoreSuccess = true;

  for (const answer of answers) {
    if (!expectDefined(store.answers[answer.field])) {
      printWarning(
        // eslint-disable-next-line
        `Build plugin required ${answer.field} to be defined - reinitialising...`
      );

      restoreSuccess = false;
    }
  }
  for (const field of data) {
    if (!expectDefined(store[field])) {
      printWarning(
        `Build plugin required ${field} to be defined - reinitialising...`
      );

      restoreSuccess = false;
    }
  }

  if (restoreSuccess) {
    printDim('\n-------- BUILD DETAILS ---------\n', 'blue');
    for (const answer of answers) {
      printDim(`${answer.question} ${store.answers[answer.field]}`, 'white');
    }
  } else {
    // eslint-disable-next-line
    await init(store);
  }
};

export const init = async (store)=> {
  if (store.completedSteps.some((step)=> step === 'init:build')) {
    await checkRestore(store);
  } else {

    await getBuildDetails(store);
    await runWebpackSetupTasks(store);

    store.emit(STEP_COMPLETE, 'init:build');
    store.completedSteps.push('init:build');
  }
};
