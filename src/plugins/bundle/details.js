

export const getBuildDetails = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Entry points (comma separated): ',
      'input',
      'buildEntries',
      store.answers.buildEntries || 'index.html.js'
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Output directory: ',
      'input',
      'buildOutputPath',
      store.answers.buildOutputPath || 'build/pkg'
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Development server port: ',
      'input',
      'devServerPort',
      store.answers.devServerPort || '8080'
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Favicon url: ',
      'input',
      'faviconUrl',
      store.answers.faviconUrl || 'favicon.png'
    )
  );

  await store.runQuestions();
};
