import {printAnswer} from '../utils';


export const nodeTarget = async (store, defaultAnswer)=> {
  const question = 'Node target: ';

  if (store.answers.nodeTarget) {
    printAnswer(question, store.answers.nodeTarget);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'nodeTarget',
        store.answers.nodeTarget || defaultAnswer || 'current'
      )
    );

    await store.runQuestions();
  }
};

export const browserTargets = async (store, defaultAnswer)=> {
  const question = 'Browser targets (comma separated): ';

  if (store.answers.browserTargets) {
    printAnswer(question, store.answers.browserTargets);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'browserTargets',
        store.answers.browserTargets
        || defaultAnswer
        || 'last 2 versions, not IE < 11'
      )
    );

    await store.runQuestions();
  }
};

export const babelPlugins = async (store, defaultAnswer)=> {
  const question = 'Extra babel plugins (comma separated): ';

  if (store.answers.babelPlugins) {
    printAnswer(question, store.answers.babelPlugins);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'babelPlugins',
        store.answers.babelPlugins || defaultAnswer || 'none'
      )
    );

    await store.runQuestions();
  }
};
