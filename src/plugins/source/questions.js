import {getLocalGitProfile} from './helpers';


export const useGit = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Would you like to use github: ',
      'confirm',
      'useGit',
      true
    )
  );

  await store.runQuestions();
};

export const useCommitizen = async (store)=> {
  if (store.answers.useGit) {
    store.addQuestion(
      store.prompter.createQuestion(
        'Would you like to use commitizen: ',
        'confirm',
        'useCommitizen',
        true
      )
    );

    await store.runQuestions();
  }
};

export const repoOwner = async (store)=> {
  const owner = await getLocalGitProfile(store);

  if (store.answers.useGit) {
    store.addQuestion(
      store.prompter.createQuestion(
        'Git username: ',
        'input',
        'repoOwner',
        store.answers.repoOwner || owner
      )
    );

    await store.runQuestions();
  }
};

export const repoOrg = async (store)=> {
  if (store.answers.useGit) {
    store.addQuestion(
      store.prompter.createQuestion(
        'Git organisation: ',
        'input',
        'repoOrg',
        store.answers.repoOrg || undefined
      )
    );
  }
};

export const repoMaintainers = async (store)=> {
  if (store.answers.useGit) {
    store.addQuestion(
      store.prompter.createRuntimeQuestion(
        ()=> 'Who are the project maintainers (comma seperated): ',
        ()=> 'input',
        ()=> 'repoMaintainers',
        ()=> store.answers.repoMaintainers || store.answers.repoOwner
      )
    );

    await store.runQuestions();
  }
};

export const initialBranches = async (store)=> {
  if (store.answers.useGit) {
    store.addQuestion(
      store.prompter.createQuestion(
        'Branches to initialise (comma seperated): ',
        'input',
        'initialBranches',
        store.answers.initialBranches || 'master, dev'
      )
    );

    await store.runQuestions();
  }
};

export const lockMasterBranch = async (store)=> {
  if (store.answers.useGit) {
    store.addQuestion(
      store.prompter.createQuestion(
        'Would you like lock down master: ',
        'confirm',
        'lockMasterBranch',
        store.answers.lockMasterBranch || true
      )
    );

    await store.runQuestions();
  }
};

export const gitAccessToken = async (store)=> {
  if (store.answers.useGit) {
    store.addQuestion(
      store.prompter.createQuestion(
        'Git access token: ',
        'input',
        'gitAccessToken',
        store.answers.gitAccessToken,
        [],
        (input)=> {
          if (!input || input === '') {
            return 'Please enter a valid access token';
          }

          return true;
        }
      )
    );

    await store.runQuestions();
  }
};
