import fs from 'fs';
import {join} from 'path';
import {execute, spawn} from '../execute';
import {fetch} from '../fetch';
import {printInfo, printDim} from '../print';
import {applifyError} from '../error';
import {
  REPO_ALREADY_EXISTS,
  REPO_CREATE_ERROR,
  REPO_AUTH_ERROR,
  GIT_INIT_ERROR,
  GIT_PULL_ERROR
} from '../error/error-codes';
import {STEP_COMPLETE, STORE_RUN} from '../events';
import {expectDefined, checkFields} from './utils';


export const requiredAnswers = [
  {question: 'Would you like to use commitizen: ', field: 'useCommitizen'},
  {question: 'Who owns the project (username): ', field: 'repoOwner'},
  {
    question: 'Who are the project maintainers (comma seperated): ',
    field: 'repoMaintainers'
  },
  {question: 'Project org name: ', field: 'repoOrg'},
  {
    question: 'Branches to initialise (comma seperated): ',
    field: 'initialBranches'
  },
  {
    question: 'Enter your GitHub personal access token: ',
    field: 'gitAccessToken'
  }
];

export const requiredFields = [
  'gitInitialised', 'gitUpToDate', 'gitRemoteAdded',
  'gitUrl', 'gitSSHUrl', 'gitHtmlUrl'
];


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
    store.prompter.createRuntimeQuestion(
      ()=> 'Who owns the project (username): ',
      ()=> 'input',
      ()=> 'repoOwner',
      async (storeCtx)=> {
        try {
          const {result} = await execute({
            cmd: 'git config user.name',
            info: 'Get git profile name'
          });

          return storeCtx.answers.repoOwner
          || result.stdout.replace(/(\r\n|\n|\r)/gm, '');
        } catch {
          return undefined;
        }
      }
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
            license_template: storeCtx.answers.projectLicense,
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
        storeCtx.gitHtmlUrl = response.html_url;

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
      const {result} = output;

      if (result.stderr) {
        throw applifyError(
          GIT_INIT_ERROR.code,
          // eslint-disable-next-line
          `${GIT_INIT_ERROR.message}: failed with ${result.stderr}`
        );
      }

      store.gitInitialised = true;
      store.gitUpToDate = false;

      return output;
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
      }, false);

      store.gitRemoteAdded = true;

      return output;
    }

    return {};
  }
});

const getPullCurrentMasterTask = ()=> ({
  type: 'task',
  description: 'pull current master',
  task: async (store)=> {
    if (!store.gitUpToDate) {
      await execute({
        cmd: `git fetch --all`,
        info: 'Git fetch from remote'
      }, false);

      const output = await execute({
        cmd: `git reset --hard origin/master`,
        info: 'Git reset master to remote'
      }, false);

      store.gitUpToDate = true;

      return output;
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

const getGitignoreString = ()=> `
# Storybook
.cache

# Dependency directory
node_modules
npm-debug.log
.idea
.DS_Store
.vscode

# Build artifacts
build

# Applify local temp and setup files
.applify

# Test config
src/private-config.js
`;

const runRewriteGitIgnoreTask = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Rewrite .gitignore',
    children: [
      {
        type: 'task',
        description: 'rewrite .gitignore in project directory',
        task: (storeCtx)=> {
          const gitignore = getGitignoreString();
          fs.writeFileSync(`${storeCtx.workingDir}/.gitignore`, gitignore);

          return {
            printInfo: `Rewrote ${storeCtx.workingDir}/.gitignore`,
            printSuccess: gitignore
          }
        }
      }
    ]
  });

  await store.runTasks();
}

// eslint-disable-next-line max-statements
const setStoreNoGit = (store)=> {
  store.gitInitialised = false;
  store.gitUpToDate = false;
  store.gitRemoteAdded = false;
  store.gitUrl = null;
  store.gitSSHUrl = null;
  store.gitHtmlUrl = null;

  store.answers.useCommitizen = false;
  store.answers.repoOwner = null;
  store.answers.repoOrg = null;
  store.answers.initialBranches = [];
  store.answers.gitAccessToken = null;
};

const parseAndReorderBranches = (branches)=> {
  if (!branches.some((branch)=> branch === 'master')) {
    branches.push('master');
  }

  if (branches[0] !== 'master') {
    const tempBranch = branches[0];

    for (let i = 0; i < branches.length; i += 1) {
      if (branches[i] === 'master') {
        branches = branches.splice(i, 0, tempBranch);
      }
    }

    branches[0] = 'master';
  }

  return branches;
}

const checkoutAndPush = async (store)=> {
  const initialBranches = store.answers.initialBranches;
  const branches = parseAndReorderBranches(
    Array.isArray(initialBranches)
    ? initialBranches
    : initialBranches.split(',')
  );

  for (const branch of branches) {
    const task = {
      type: 'batch',
      description: `Checkout and commit initial branch ${branch}`,
      children: []
    }

    if (branch !== 'master') {
      task.children.push({
        type: 'task',
        description: `checking out ${branch}`,
        task: async (storeCtx)=> {
          const output = await execute({
            cmd: `git checkout -b ${branch}`,
            info: `Git checkout ${branch}`
          }, false);

          return output;
        }
      })
    }

    task.children.push({
      type: 'task',
      description: `adding ${branch} files`,
      task: async (storeCtx)=> {
        const output = await execute({
          cmd: 'git add -A',
          info: `Git add ${branch}`
        }, false);

        return output;
      }
    });

    if (store.answers.useCommitizen) {
      store.addTask(task);
      await store.runTasks();

      await spawn({
        cmd: 'npx',
        args: ['git-cz'],
        info: `Commit ${branch} with commitizen standard`
      }, false);
    } else {
      task.children.push({
        type: 'task',
        description: `commiting ${branch}`,
        task: async (storeCtx)=> {
          const output = await execute({
            cmd: 'git commit -m "Project setup and initial files"',
            info: `Git commit ${branch}`
          });

          return output;
        }
      });

      store.addTask(task);
    }

    store.addTask({
      type: 'batch',
      description: `Push changes to ${branch}`,
      children: [
        {
          type: 'task',
          description: `push changes to ${branch} to remote origin`,
          task: async (storeCtx)=> {
            const output = await execute({
              cmd: `git push origin ${branch}`,
              info: `Git push ${branch}`
            });

            return output;
          }
        }
      ]
    });
  }

  await store.runTasks();
};

const setupCommitizen = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Install and setup commitizen',
    children: [
      {
        type: 'task',
        description: 'install commitizen globally',
        task: async (storeCtx)=> {
          const output = storeCtx.packageInstaller.install(
            'commitizen', 'global'
          );

          return output;
        }
      },
      {
        type: 'task',
        description: 'install skan-io commit config',
        task: async (storeCtx)=> {
          const output = storeCtx.packageInstaller.install(
            '@skan-io/release-config'
          );

          return output;
        }
      }
    ]
  });

  if (store.answers.privatePackage) {
    store.addTask({
      type: 'batch',
      description: 'Remove .releaserc',
      children: [
        {
          type: 'task',
          description: 'remove .releaserc (for public packages)',
          task: (storeCtx)=> {
            const releaseFile = join(storeCtx.workingDir, '.releaserc');

            fs.unlinkSync(releaseFile);

            return {
              printInfo: `Removed ${releaseFile}`
            }
          }
        }
      ]
    });
  }

  await store.runTasks();
};

// eslint-disable-next-line max-statements, complexity
export const checkRestore = async (store, config)=> {
  // TODO requiredConditionals?
  const useGit = {question: 'Would you like to use github: ', field: 'useGit'};

  let restoreSuccess = true;

  if (
    expectDefined(store.answers[useGit.field])
  ) {
    restoreSuccess = checkFields(
      store, 'Source', requiredAnswers, requiredFields
    );
  } else {
    restoreSuccess = false;
  }

  if (restoreSuccess) {
    printDim('\n-------- SOURCE DETAILS ---------\n', 'blue');
    printDim(`${useGit.question} ${store.answers[useGit.field]}`, 'white');
    for (const answer of requiredAnswers) {
      printDim(`${answer.question} ${store.answers[answer.field]}`, 'white');
    }
  } else {
    // eslint-disable-next-line
    await init(store, config, false);
  }
};

export const init = async (store, config, restore=true)=> {
  if (
    restore
    && store.completedSteps.some((step)=> step === 'init:source')
  ) {
    await checkRestore(store, config);
  } else {
    await getShouldUseGit(store);

    if (store.answers.useGit) {
      await getRepoDetails(store, config);
      await getGitAccessToken(store, config);

      await runGitInitialisationTasks(store);
      await runRewriteGitIgnoreTask(store);
    } else {
      setStoreNoGit(store);
    }

    store.emit(STEP_COMPLETE, 'init:source');
    store.completedSteps.push('init:source');
  }
};

export const run = async (store)=> {
 if (!store.completedSteps.some((step)=> step === 'run:source')) {
   // Run the commitizen setup
  if (store.answers.useCommitizen) {
    await setupCommitizen(store);
  }

  // When we have finished running all the steps we can push the
  // setup project to github
  store.on(STORE_RUN, async ()=> {
    if (store.answers.useGit) {
      await checkoutAndPush(store);
    }

    store.emit(STEP_COMPLETE, 'run:source');
    store.completedSteps.push('run:source');
  });
 }
}


// TODO run - create branches (with amplify envs) and push all changes, install
// and setup commitizen
