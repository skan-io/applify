import {printAnswer} from '../utils';


export const useCommitizen = async (store)=> {
  const question = 'Use commitizen: ';

  if (store.answers.useGit && store.answers.useCommitizen === undefined) {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'confirm',
        'useCommitizen',
        true
      )
    );

    await store.runQuestions();
  } else if (store.answers.useCommitizen !== undefined) {
    printAnswer(question, store.answers.useCommitizen);
  }
};

export const repoOwner = async (store, defaultAnswer)=> {
  const question = 'Git username: ';

  if (store.answers.useGit && !store.answers.repoOwner) {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'repoOwner',
        store.answers.repoOwner || defaultAnswer,
        undefined,
        (input)=> { // validate
          if (!input || input === '') {
            return 'Please enter a valid git username';
          }
          return true;
        }
      )
    );

    await store.runQuestions();
  } else if (store.answers.repoOwner) {
    printAnswer(question, store.answers.repoOwner);
  }
};

export const repoOrg = async (store)=> {
  const question = 'Git organisation: ';

  if (store.answers.useGit && !store.answers.repoOrg) {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'repoOrg',
        store.answers.repoOrg || 'none'
      )
    );
  } else if (store.answers.repoOrg) {
    printAnswer(question, store.answers.repoOrg);
  }
};

export const repoMaintainers = async (store)=> {
  const question = 'Maintainers (comma separated): ';

  if (store.answers.useGit && !store.answers.repoMaintainers) {
    store.addQuestion(
      store.prompter.createRuntimeQuestion(
        ()=> question,
        ()=> 'input',
        ()=> 'repoMaintainers',
        ()=> store.answers.repoMaintainers || store.answers.repoOwner
      )
    );

    await store.runQuestions();
  } else if (store.answers.repoMaintainers) {
    printAnswer(question, store.answers.repoMaintainers);
  }
};

export const initialBranches = async (store)=> {
  const question = 'Branches to initialise (comma seperated): ';

  if (store.answers.useGit && !store.answers.initialBranches) {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'input',
        'initialBranches',
        store.answers.initialBranches || 'master, dev'
      )
    );

    await store.runQuestions();
  } else if (store.answers.initialBranches) {
    printAnswer(question, store.answers.initialBranches);
  }
};

export const lockMasterBranch = async (store)=> {
  const question = 'Restrict master branch: ';

  if (store.answers.useGit && store.answers.lockMasterBranch === undefined) {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
        'confirm',
        'lockMasterBranch',
        store.answers.lockMasterBranch || true
      )
    );

    await store.runQuestions();
  } else if (store.answers.lockMasterBranch !== undefined) {
    printAnswer(question, store.answers.lockMasterBranch);
  }
};

export const gitAccessToken = async (store)=> {
  const question = 'Git access token: ';
  if (store.answers.useGit && !store.answers.gitAccessToken) {
    store.addQuestion(
      store.prompter.createQuestion(
        question,
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
  } else if (store.answers.gitAccessToken) {
    printAnswer(question, store.answers.gitAccessToken);
  }
};
