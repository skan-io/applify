import {STEP_COMPLETE} from '../events';
import {checkFields} from './utils';
import {printInfo, printDim} from '../print';


export const requiredFields = [];

export const requiredAnswers = [
  {question: 'Choose your style: ', field: 'styleChoice'},
  {question: 'Choose your ui: ', field: 'uiChoice'}
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

  printInfo('\n-------- SOURCE DETAILS ---------\n');

  await store.runQuestions();
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
  }

  store.emit(STEP_COMPLETE, 'init:style');
  store.completedSteps.push('init:style');
};
