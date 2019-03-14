import {printAnswer} from '../utils';


const STORYBOOK_PORT = 8000;


export const uiChoice = async (store, defaultAnswer)=> {
  const question = 'Ui kit: ';

  if (store.answers.uiChoice) {
    printAnswer(question, store.answers.uiChoice);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'list',
        'uiChoice',
        store.answers.uiChoice || defaultAnswer || 'skan-ui',
        [
          'skan-ui',
          'react-shards',
          'reactstrap',
          'reactstrap/argon',
          'material',
          'none'
        ]
      )
    );

    await store.runQuestions();
  }
};
