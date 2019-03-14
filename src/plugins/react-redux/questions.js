import {printAnswer} from '../utils';


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
