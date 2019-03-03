

export const getBabelDetails = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Node target: ',
      'input',
      'nodeTarget',
      store.answers.nodeTarget || 'current'
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Browser targets (comma separated): ',
      'input',
      'browserTargets',
      store.answers.browserTargets || 'last 2 versions, not IE < 11'
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Would you like to add extra babel plugins: ',
      'input',
      'babelPlugins',
      store.answers.babelPlugins || 'none'
    )
  );

  await store.runQuestions();
};

export const getReduxDetails = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Would you like to use redux: ',
      'confirm',
      'useRedux',
      store.answers.useRedux || true
    )
  );

  await store.runQuestions();
};

export const getRouterDetails = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Would you like to use router: ',
      'confirm',
      'useRouter',
      store.answers.useRouter || false
    )
  );

  await store.runQuestions();
};

export const getLinterDetails = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Would you like to use eslint: ',
      'confirm',
      'useEslint',
      store.answers.useEslint || true
    )
  );

  await store.runQuestions();
};
