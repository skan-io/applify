import {sep} from 'path';
import {printAnswer} from '../utils';


export const projectName = async (store, defaultAnswer)=> {
  const question = 'Project name: ';

  if (store.answers.projectName) {
    printAnswer(question, store.answers.projectName);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'projectName',
        process.cwd()
          .split(sep)
          .pop() || defaultAnswer
      )
    );

    await store.runQuestions();
  }
};

export const projectDescription = async (store, defaultAnswer)=> {
  const question = 'Project description: ';

  if (store.answers.projectDescription) {
    printAnswer(question, store.answers.projectDescription);
  } else {
    store.addQuestion(
      store.prompter.createRuntimeQuestion(
        ()=> 'Project description: ',
        ()=> 'input',
        ()=> 'projectDescription',
        (storeCtx)=>
          storeCtx.answers.projectDescription || defaultAnswer ||
          `A react boilerplate application for ${storeCtx.answers.projectName}`
      )
    );

    await store.runQuestions();
  }
};

export const projectAuthor = async (store, defaultAnswer)=> {
  const question = 'Project author: ';

  if (store.answers.projectAuthor) {
    printAnswer(question, store.answers.projectAuthor);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'projectAuthor',
        store.answers.projectAuthor || defaultAnswer,
        undefined, // choices
        (input)=> {
          if (!input || input === '') {
            return 'Please enter a valid author name';
          }
          return true;
        }
      )
    );

    await store.runQuestions();
  }
};

export const projectPrivate = async (store, defaultAnswer)=> {
  const question = 'Is this a private project: ';

  if (store.answers.projectPrivate === undefined) {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'confirm',
        'projectPrivate',
        store.answers.projectPrivate || defaultAnswer
      )
    );

    await store.runQuestions();
  } else {
    printAnswer(question, store.answers.projectPrivate);
  }
};

export const projectLicense = async (store, defaultAnswer)=> {
  const question = 'Choose a license: ';

  if (!store.answers.projectPrivate && !store.answers.projectLicense) {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'list',
        'projectLicense',
        store.answers.projectLicense || defaultAnswer || 'MIT',
        [
          'MIT',
          'ISC',
          'Apache-2.0',
          'GPL-3.0',
          'BSD-2-clause',
          'BSD-3-clause',
          'CC',
          'WTFPL',
          'UNLICENSE'
        ]
      )
    );

    await store.runQuestions();
  } else if (store.answers.projectLicense) {
    printAnswer(question, store.answers.projectLicense);
  }
};
