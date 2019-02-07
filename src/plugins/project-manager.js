import {sep} from 'path';


export const init = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'What is the project name: ',
      'input',
      'projectName',
      // eslint-disable-next-line
      process.cwd().split(sep).pop()
    )
  );
  store.addQuestion(
    store.prompter.createQuestion(
      'What is the project scope: ',
      'input',
      'orgScope',
      // eslint-disable-next-line
      'none'
    )
  );
};
