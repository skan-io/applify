import {execute} from '../execute';
import {fetch} from '../fetch';
import {printInfo, printWarning, printDim} from '../print';
import {applifyError} from '../error';
import {
  REPO_ALREADY_EXISTS,
  REPO_CREATE_ERROR,
  REPO_AUTH_ERROR,
  GIT_INIT_ERROR,
  GIT_PULL_ERROR
} from '../error/error-codes';
import {STEP_COMPLETE} from '../events';
import {expectDefined} from './utils';


const getShouldUseGit = async (store)=> {
  store.addQuestion(
    store.prompter.createQuestion(
      'Would you like to use github: ',
      'confirm',
      'useGit',
      true
    )
  );

  printInfo('\n-------- SOURCE DETAILS ---------\n');
  await store.runQuestions();
};

const getRepoDetails = async (store, config)=> {
  const initialBranches = config.branches
    ? config.branches
    : ['master', 'project-init'];

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
      store.answers.repoOwner || undefined
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
      'Is this a private project: ',
      'confirm',
      'privatePackage',
      store.answers.privatePackage || false
    )
  );

  await store.runQuestions();
};

const getGitAccessToken = async (store, config)=> {
  const defaultToken = config.gitAccessToken
    ? config.gitAccessToken
    : undefined;

  store.addQuestion(
    store.prompter.createQuestion(
      'Enter your GitHub personal access token: ',
      'input',
      'gitAccessToken',
      store.answers.gitAccessToken || defaultToken
    )
  );

  await store.runQuestions();
};

const getInitialiseGitRemoteTask = ()=> ({
  type: 'task',
  description: 'intialise git remote',
  // eslint-disable-next-line max-statements
  task: async (storeCtx)=> {
    if (!storeCtx.gitUrl && !storeCtx.gitSSHUrl) {
      try {
        const {response, printInfo: info, printSuccess} = await fetch(
          storeCtx.answers.repoOrg
            ? `https://api.github.com/orgs/${storeCtx.answers.repoOrg}/repos`
            : 'https://api.github.com/user/repos',
          'POST',
          JSON.stringify({
            name: storeCtx.answers.projectName,
            description: storeCtx.answers.projectDescription,
            private: storeCtx.answers.privatePackage,
            // eslint-disable-next-line
            auto_init: true,
            // eslint-disable-next-line
            gitignore_template: 'Node'
          }),
          storeCtx.answers.gitAccessToken,
          null,
          true
        );

        storeCtx.gitUrl = response.git_url;
        storeCtx.gitSSHUrl = response.ssh_url;

        return {
          printInfo: info,
          printSuccess
        };
      } catch ({code}) {
        // TODO - maybe can resume a project from here? Or maybe not the job
        // of the init function..
        // eslint-disable-next-line
        if (code === 422) {
          throw applifyError(
            REPO_ALREADY_EXISTS.code,
            `${REPO_ALREADY_EXISTS.message}: Repository already exists`
          );
        }
        // eslint-disable-next-line
        if (code === 401 || code === 403) {
          throw applifyError(
            REPO_AUTH_ERROR.code,
            `${REPO_AUTH_ERROR.message}: Invalid access token`
          );
        }

        throw applifyError(
          REPO_CREATE_ERROR.code,
          `${REPO_CREATE_ERROR.message}: Cannot create repository`
        );
      }
    }

    return {};
  }
});

const getInitialiseGitLocalTask = ()=> ({
  type: 'task',
  description: 'intialise git locally',
  task: async (store)=> {
    if (!store.gitInitialised) {
      const output = await execute({cmd: 'git init .', info: 'Git init'});
      const {
        result,
        printInfo: info,
        printWarning: warning,
        printError: error,
        printSuccess: success
      } = output;

      if (result.stderr) {
        throw applifyError(
          GIT_INIT_ERROR.code,
          // eslint-disable-next-line
          `${GIT_INIT_ERROR.message}: failed with ${result.stderr}`
        );
      }

      store.gitInitialised = true;
      store.gitUpToDate = false;

      return {
        printInfo: info,
        printWarning: warning,
        printError: error,
        printSuccess: success
      };
    }

    return {};
  }
});


const getAddGitRemoteTask = ()=> ({
  type: 'task',
  description: 'add git remote',
  task: async (store)=> {
    if (!store.gitRemoteAdded) {
      const output = await execute({
        cmd: `git remote add origin ${store.gitSSHUrl}`,
        info: 'Add git ssh remote'
      });

      const {
        result,
        printInfo: info,
        printWarning: warning,
        printError: error,
        printSuccess: success
      } = output;

      if (result.stderr) {
        throw applifyError(
          GIT_INIT_ERROR.code,
          // eslint-disable-next-line
          `${GIT_INIT_ERROR.message}: failed with ${result.stderr}`
        );
      }

      store.gitRemoteAdded = true;

      return {
        printInfo: info,
        printWarning: warning,
        printError: error,
        printSuccess: success
      };
    }

    return {};
  }
});

const getPullCurrentMasterTask = ()=> ({
  type: 'task',
  description: 'pull current master',
  task: async (store)=> {
    if (!store.gitUpToDate) {
      const output = await execute({
        cmd: `git pull origin master`,
        info: 'Git pull master'
      });

      const {
        printInfo: info,
        printWarning: warning,
        printError: error,
        printSuccess: success
      } = output;

      store.gitUpToDate = true;

      return {
        printInfo: info,
        printWarning: warning,
        printError: error,
        printSuccess: success
      };
    }

    return {};
  }
});

const runGitInitialisationTasks = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Initialise git repository',
    children: [
      getInitialiseGitRemoteTask(),
      getInitialiseGitLocalTask(),
      getAddGitRemoteTask(),
      getPullCurrentMasterTask()
    ]
  });

  await store.runTasks();
};

// eslint-disable-next-line max-statements, complexity
export const checkRestore = async (store, config)=> {
  const useGit = {question: 'Would you like to use github:', field: 'useGit'};
  const answers = [
    {question: 'Would you like to use commitizen: ', field: 'useCommitizen'},
    {question: 'Who owns the project (username): ', field: 'repoOwner'},
    {question: 'Project org name: ', field: 'repoOrg'},
    {
      question: 'Branches to initialise (comma seperated): ',
      field: 'initialBranches'
    },
    {question: 'Is this a private project: ', field: 'privatePackage'},
    {
      question: 'Enter your GitHub personal access token: ',
      field: 'gitAccessToken'
    }
  ];
  const data = [
    'gitInitialised', 'gitUpToDate', 'gitRemoteAdded', 'gitUrl', 'gitSSHUrl'
  ];
  let restoreSuccess = true;

  if (
    expectDefined(store.answers[useGit.field])
    && store.answers[useGit.field] === true
  ) {
    for (const answer of answers) {
      if (!expectDefined(store.answers[answer.field])) {
        printWarning(
          // eslint-disable-next-line
          `Source plugin required ${answer.field} to be defined - reinitialising...`
        );
        restoreSuccess = false;
        break;
      }
    }
    for (const field of data) {
      if (!expectDefined(store[field])) {
        printWarning(
          `Source plugin required ${field} to be defined - reinitialising...`
        );
        restoreSuccess = false;
        break;
      }
    }
  } else {
    restoreSuccess = false;
  }

  if (restoreSuccess) {
    printDim('\n-------- SOURCE DETAILS ---------\n', 'blue');
    printDim(`${useGit.question} ${store.answers[useGit.field]}`, 'white');
    for (const answer of answers) {
      printDim(`${answer.question} ${store.answers[answer.field]}`, 'white');
    }
  } else {
    // eslint-disable-next-line
    await init(store, config);
  }
};

export const init = async (store, config)=> {
  if (store.completedSteps.some((step)=> step === 'init:source')) {
    await checkRestore(store, config);
  } else {
    await getShouldUseGit(store);

    if (store.answers.useGit) {
      await getRepoDetails(store, config);
      await getGitAccessToken(store, config);

      await runGitInitialisationTasks(store);
    }

    store.emit(STEP_COMPLETE, 'init:source');
    store.completedSteps.push('init:source');
  }
};
