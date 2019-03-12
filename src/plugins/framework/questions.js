import {printAnswer} from '../utils';


export const useRedux = async (store, defaultAnswer)=> {
  const question = 'Use redux: ';

  if (store.answers.useRedux === undefined) {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'confirm',
        'useRedux',
        store.answers.useRedux || defaultAnswer || true
      )
    );

    await store.runQuestions();
  } else {
    printAnswer(question, store.answers.useRedux);
  }
};

export const useRouter = async (store, defaultAnswer)=> {
  const question = 'Use router: ';

  if (store.answers.useRouter === undefined) {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'confirm',
        'useRouter',
        store.answers.useRouter || defaultAnswer || false
      )
    );

    await store.runQuestions();
  } else {
    printAnswer(question, store.answers.useRouter);
  }
};

export const useEslint = async (store, defaultAnswer)=> {
  const question = 'Use eslint: ';

  if (store.answers.useEslint === undefined) {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'confirm',
        'useEslint',
        store.answers.useEslint || defaultAnswer || true
      )
    );

    await store.runQuestions();
  } else {
    printAnswer(question, store.answers.useEslint);
  }
};
