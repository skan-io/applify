import {printAnswer} from '../utils';


export const ciPlatform = async (store, defaultAnswer)=> {
  const question = 'Choose your CI platform: ';

  if (store.answers.ciPlatform) {
    printAnswer(question, store.answers.ciPlatform);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'list',
        'ciPlatform',
        store.answers.ciPlatform || defaultAnswer || 'travis-ci',
        ['travis-ci', 'circle-ci', 'codebuild']
      )
    );

    await store.runQuestions();
  }
};

export const deployEnv = async (store, defaultAnswer)=> {
  const question = 'Deployment environment (app url): ';

  if (store.answers.deployEnv) {
    printAnswer(question, store.answers.deployEnv);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'deployEnv',
        store.answers.deploymentEnv || defaultAnswer,
        undefined,
        (input)=> {
          if (!input || input === '') {
            return 'Please enter a valid deployment url';
          }
          return true;
        }
      )
    );

    await store.runQuestions();
  }
};

export const deployPath = async (store, defaultAnswer)=> {
  const question = 'Deployment path (app route): ';

  if (store.answers.deployPath) {
    printAnswer(question, store.answers.deployPath);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'deployPath',
        store.answers.deploymentEnv || defaultAnswer || 'none'
      )
    );

    await store.runQuestions();
  }
};
