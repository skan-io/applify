import {STEP_COMPLETE} from '../events';
import {checkFields} from './utils';
import {printInfo, printDim} from '../print';


export const requiredFields = ['storybookInstalled'];

export const requiredAnswers = [
  {question: 'Choose your style: ', field: 'styleChoice'},
  {question: 'Choose your ui: ', field: 'uiChoice'},
  {question: 'Would you like to use storybook: ', field: 'useStorybook'}
];


const getStyleDetails = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Choose your style language: ',
      'list',
      'styleChoice',
      store.answers.styleChoice || 'sass',
      ['sass', 'css']
    )
  );

  store.addQuestion(
    store.prompter.createRuntimeQuestion(
      ()=> 'Choose your ui kit: ',
      ()=> 'list',
      ()=> 'uiChoice',
      ()=> store.answers.uiChoice || 'skan-ui',
      ()=> (
        store.answers.styleChoice === 'sass'
          ? ['skan-ui', 'bootstrap/argon', 'material', 'none']
          : ['bootstrap', 'material', 'none']
      )
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Would you like to use storybook: ',
      'confirm',
      'useStorybook',
      store.answers.useStorybook || true
    )
  );

  printInfo('\n-------- UI DETAILS ---------\n');

  await store.runQuestions();
};

const installStorybook = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Install storybook dependencies',
    children: [
      {
        type: 'task',
        description: 'install storybook and storybook addons',
        task: async (storeCtx)=> {
          const output = await storeCtx.packageInstaller.install(
            // TODO: make this a skan-io config
            // eslint-disable-next-line
            '@storybook/react @storybook/addons @storybook/addon-storyshots @storybook/addon-links @storybook/addon-knobs @storybook/addon-info @storybook/addon-actions'
          );

          storeCtx.storybookInstalled = true;

          return output;
        }
      }
    ]
  });
};


export const checkRestore = async (store)=> {
  const restoreSuccess = checkFields(
    store, 'Style', requiredAnswers, requiredFields
  );

  if (restoreSuccess) {
    printDim('\n-------- STYLE DETAILS ---------\n', 'blue');
    for (const answer of requiredAnswers) {
      printDim(`${answer.question} ${store.answers[answer.field]}`, 'white');
    }
  } else {
    // eslint-disable-next-line
    await init(store, undefined, false);
  }
};

export const init = async (store, config, restore=true)=> {
  if (
    restore
    && store.completedSteps.some((step)=> step === 'init:style')
  ) {
    await checkRestore(store);
  } else {
    await getStyleDetails(store);

    if (store.answers.useStorybook) {
      await installStorybook(store);
    } else {
      store.storybookInstalled = false;
    }
  }

  store.emit(STEP_COMPLETE, 'init:style');
  store.completedSteps.push('init:style');
};
