import {printAnswer} from '../utils';


export const htmlMain = async (store, defaultAnswer)=> {
  const question = 'Html entry file: ';

  if (store.answers.htmlMain) {
    printAnswer(question, store.answers.htmlMain);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'htmlMain',
        store.answers.htmlMain || defaultAnswer || 'index.html.js',
        undefined,
        (input)=> {
          if (!input || input === '') {
            return 'Please enter a valid html entry file';
          }
          if (!input.endsWith('.html.js')) {
            return 'Filename must end with ".html.js"';
          }

          return true;
        }
      )
    );

    await store.runQuestions();
  }
};

export const htmlTitle = async (store, defaultAnswer)=> {
  const question = 'Page title: ';

  if (store.answers.htmlTitle) {
    printAnswer(question, store.answers.htmlTitle);
  } else {
    store.addQuestion(
      store.prompter.createRuntimeQuestion(
        ()=> question,
        ()=> 'input',
        ()=> 'htmlTitle',
        (storeCtx)=> storeCtx.answers.htmlTitle
          || defaultAnswer
          || storeCtx.answers.projectName
      )
    );

    await store.runQuestions();
  }
};

export const htmlTwitter = async (store, defaultAnswer)=> {
  const question = 'Twitter handle: ';

  if (store.answers.htmlTwitter) {
    printAnswer(question, store.answers.htmlTwitter);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'htmlTwitter',
        store.answers.htmlTwitter || defaultAnswer,
        undefined,
        (input)=> {
          if (input && !input.startsWith('@')) {
            return 'Twitter handle must start with "@"';
          }
          return true;
        }
      )
    );

    await store.runQuestions();
  }
};

export const htmlCopyright = async (store, defaultAnswer)=> {
  const question = 'Copyright owned by: ';

  if (store.answers.htmlCopyright) {
    printAnswer(question, store.answers.htmlCopyright);
  } else {
    store.addQuestion(
      store.prompter.createRuntimeQuestion(
        ()=> question,
        ()=> 'input',
        ()=> 'htmlCopyright',
        (storeCtx)=>
          store.answers.htmlCopyright
          || defaultAnswer
          || storeCtx.answers.projectAuthor
      )
    );

    await store.runQuestions();
  }
};

export const htmlKeywords = async (store, defaultAnswer)=> {
  const question = 'Page keywords: ';

  if (store.answers.htmlKeywords) {
    printAnswer(question, store.answers.htmlKeywords);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'htmlKeywords',
        store.answers.htmlKeywords
        || defaultAnswer
      )
    );

    await store.runQuestions();
  }
};

export const htmlShareImg = async (store, defaultAnswer)=> {
  const question = 'Share image url: ';

  if (store.answers.htmlShareImg) {
    printAnswer(question, store.answers.htmlShareImg);
  } else {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'htmlShareImg',
        store.answers.htmlShareImg
        || defaultAnswer || 'share-img.jpg'
      )
    );

    await store.runQuestions();
  }
};
