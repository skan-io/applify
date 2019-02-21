import {STEP_COMPLETE} from '../events';
import {printInfo, printDim} from '../print';
import {checkFields} from './utils';


export const requiredAnswers = [
  {question: 'Entry points (module names): ', field: 'buildEntries'},
  {question: 'Output directory: ', field: 'buildOutputPath'},
  {question: 'Development server port: ', field: 'devServerPort'},
  {question: 'Favicon url: ', field: 'faviconUrl'}
];

export const requiredFields = ['webpackInstalled'];


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

            if (output.result.stderr) {
              storeCtx.webpackInstalled = false;
            } else {
              storeCtx.webpackInstalled = true;
            }

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
  const restoreSuccess = checkFields(
    store, 'Build', requiredAnswers, requiredFields
  );

  if (restoreSuccess) {
    printDim('\n-------- BUILD DETAILS ---------\n', 'blue');
    for (const answer of requiredAnswers) {
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
