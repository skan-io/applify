import {printAnswer} from '../utils';


const STORYBOOK_PORT = 8000;


export const storybookServerPort = async (store, defaultAnswer)=> {
  const question = 'Storybook server port: ';

  if (store.answers.storybookServerPort) {
    printAnswer(question, store.answers.storybookServerPort);
  } else {
    store.addQuestion(
      store.prompter.createRuntimeQuestion(
        ()=> question,
        ()=> 'input',
        ()=> 'storybookServerPort',
        ()=> store.answers.storybookServerPort
          || defaultAnswer
          || STORYBOOK_PORT,
        undefined,
        (storeCtx)=> (input)=> {
          if (!input || !Number.isInteger(input)) {
            return 'Please enter a valid port';
          }
          if (input === storeCtx.answers.devServerPort) {
            return 'Please enter a different port to webpack port';
          }
          return true;
        }
      )
    );

    await store.runQuestions();
  }
};
