

export const getUseCi = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Use CI: ',
      'confirm',
      'useCi',
      store.answers.useCi || true
    )
  );

  await store.runQuestions();
};

export const getCIPlatformDetails = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Choose your CI platform: ',
      'list',
      'ciPlatform',
      store.answers.ciPlatform || 'travis-ci',
      ['travis-ci', 'circle-ci', 'codebuild']
    )
  );

  await store.runQuestions();
};

export const getDeployDetails = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'What is the deployment environment (app url): ',
      'input',
      'deployEnv',
      store.answers.deploymentEnv
    )
  );
  
  store.addQuestion(
    store.prompter.createQuestion(
      'What is the deployment path (app route): ',
      'input',
      'deployPath',
      store.answers.deploymentPath
    )
  );

  await store.runQuestions();
};
