import {printAnswer} from '../utils';


export const buildEntries = async (store, defaultAnswer)=> {
  const question = 'Entry points (comma separated): ';

  if (store.answers.buildEntries) {
    printAnswer(question, store.answers.buildEntries);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'buildEntries',
        store.answers.htmlMain
          || store.answers.buildEntries
          || defaultAnswer
          || 'index.html.js',
        undefined,
        (input)=> {
          if (!input || input === '') {
            return 'Please enter a valid entry point';
          }
          return true;
        }
      )
    );

    await store.runQuestions();
  }
};

export const buildOutputPath = async (store, defaultAnswer)=> {
  const question = 'Output directory: ';

  if (store.answers.buildOutputPath) {
    printAnswer(question, store.answers.buildOutputPath);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        'Output directory: ',
        'input',
        'buildOutputPath',
        store.answers.buildOutputPath || defaultAnswer || 'build/pkg',
        undefined,
        (input)=> {
          if (!input || input === '') {
            return 'Please enter a valid output path';
          }
          return true;
        }
      )
    );

    await store.runQuestions();
  }
};

export const devServerPort = async (store, defaultAnswer)=> {
  const question = 'Development server port: ';

  if (store.answers.devServerPort) {
    printAnswer(question, store.answers.devServerPort);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        'Development server port: ',
        'input',
        'devServerPort',
        store.answers.devServerPort || defaultAnswer || '8080',
        undefined,
        (input)=> {
          if (!input || !Number.isInteger(input)) {
            return 'Please enter a valid port';
          }
          return true;
        }
      )
    );

    await store.runQuestions();
  }
};
