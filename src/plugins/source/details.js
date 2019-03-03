import {execute} from '../../execute';


export const getShouldUseGit = async (store)=> {
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

const getLocalGitProfile = async (store)=> {
  try {
    if (store.answers.repoOwner) {
      return store.answers.repoOwner;
    }

    const {result} = await execute({
      cmd: 'git config user.name',
      info: 'Get git profile name'
    });

    return result.stdout.replace(/(\r\n|\n|\r)/gm, '');
  } catch (err) {
    return 'none';
  }
};

export const getRepoDetails = async (store, config)=> {
  const initialBranches = config.branches
    ? config.branches
    : ['master', 'project-init'];

  const repoOwner = await getLocalGitProfile(store);

  store.addQuestion(
    store.prompter.createQuestion(
      'Would you like to use commitizen: ',
      'confirm',
      'useCommitizen',
      true
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Who owns the project (username): ',
      'input',
      'repoOwner',
      repoOwner
    )
  );

  store.addQuestion(
    store.prompter.createRuntimeQuestion(
      ()=> 'Who are the project maintainers (comma seperated): ',
      ()=> 'input',
      ()=> 'repoMaintainers',
      ()=> store.answers.repoMaintainers || store.answers.repoOwner
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Project org name: ',
      'input',
      'repoOrg',
      store.answers.repoOrg || undefined
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Branches to initialise (comma seperated): ',
      'input',
      'initialBranches',
      store.answers.initialBranches || initialBranches
    )
  );

  store.addQuestion(
    store.prompter.createQuestion(
      'Would you like lock down master: ',
      'confirm',
      'lockMasterBranch',
      store.answers.lockMasterBranch || true
    )
  );

  await store.runQuestions();
};

export const getGitAccessToken = async (store, config)=> {
  const defaultToken = config.gitAccessToken
    ? config.gitAccessToken
    : undefined;

  store.addQuestion(
    store.prompter.createQuestion(
      'Enter your GitHub personal access token: ',
      'input',
      'gitAccessToken',
      store.answers.gitAccessToken || defaultToken,
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
};
