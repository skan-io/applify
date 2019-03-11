
const STORYBOOK_PORT = 8080;


export const getStyleDetails = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Choose your style language: ',
      'list',
      'styleChoice',
      store.answers.styleChoice || 'sass',
      ['sass', 'css']
    )
  );

  store.addQuestion(
    store.prompter.createRuntimeQuestion(
      ()=> 'Choose your ui kit: ',
      ()=> 'list',
      ()=> 'uiChoice',
      ()=> store.answers.uiChoice || 'skan-ui',
      ()=> (
        store.answers.styleChoice === 'sass'
          ? ['skan-ui', 'bootstrap/argon', 'material', 'none']
          : ['bootstrap', 'material', 'none']
      )
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Would you like to use storybook: ',
      'confirm',
      'useStorybook',
      store.answers.useStorybook || true
    )
  );

  await store.runQuestions();
};

export const getStorybookDetails = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Storybook server port: ',
      'input',
      'storybookServerPort',
      store.answers.storybookServerPort || STORYBOOK_PORT
    )
  );

  await store.runQuestions();
};
