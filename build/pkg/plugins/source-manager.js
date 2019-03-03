"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = exports.init = exports.checkRestore = exports.requiredFields = exports.requiredAnswers = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = require("path");

var _execute = require("../execute");

var _fetch = require("../fetch");

var _print = require("../print");

var _error = require("../error");

var _errorCodes = require("../error/error-codes");

var _events = require("../events");

var _utils = require("./utils");

var _strings = require("../utils/strings");

const requiredAnswers = [{
  question: 'Would you like to use commitizen: ',
  field: 'useCommitizen'
}, {
  question: 'Who owns the project (username): ',
  field: 'repoOwner'
}, {
  question: 'Who are the project maintainers (comma seperated): ',
  field: 'repoMaintainers'
}, {
  question: 'Project org name: ',
  field: 'repoOrg'
}, {
  question: 'Branches to initialise (comma seperated): ',
  field: 'initialBranches'
}, {
  question: 'Enter your GitHub personal access token: ',
  field: 'gitAccessToken'
}, {
  question: 'Would you like lock down master: ',
  field: 'lockMasterBranch'
}];
exports.requiredAnswers = requiredAnswers;
const requiredFields = [];
exports.requiredFields = requiredFields;

const getShouldUseGit = async store => {
  store.addQuestion(store.prompter.createQuestion('Would you like to use github: ', 'confirm', 'useGit', true));
  (0, _print.printInfo)('\n-------- SOURCE DETAILS ---------\n');
  await store.runQuestions();
};

const getRepoDetails = async (store, config) => {
  const initialBranches = config.branches ? config.branches : ['master', 'project-init'];
  store.addQuestion(store.prompter.createQuestion('Would you like to use commitizen: ', 'confirm', 'useCommitizen', true));
  store.addQuestion(store.prompter.createRuntimeQuestion(() => 'Who owns the project (username): ', () => 'input', () => 'repoOwner', async storeCtx => {
    try {
      const {
        result
      } = await (0, _execute.execute)({
        cmd: 'git config user.name',
        info: 'Get git profile name'
      });
      return storeCtx.answers.repoOwner || result.stdout.replace(/(\r\n|\n|\r)/gm, '');
    } catch (_unused) {
      return undefined;
    }
  }));
  store.addQuestion(store.prompter.createRuntimeQuestion(() => 'Who are the project maintainers (comma seperated): ', () => 'input', () => 'repoMaintainers', () => store.answers.repoMaintainers || store.answers.repoOwner));
  store.addQuestion(store.prompter.createQuestion('Project org name: ', 'input', 'repoOrg', store.answers.repoOrg || undefined));
  store.addQuestion(store.prompter.createQuestion('Branches to initialise (comma seperated): ', 'input', 'initialBranches', store.answers.initialBranches || initialBranches));
  store.addQuestion(store.prompter.createQuestion('Would you like lock down master: ', 'confirm', 'lockMasterBranch', store.answers.lockMasterBranch || true));
  await store.runQuestions();
};

const getGitAccessToken = async (store, config) => {
  const defaultToken = config.gitAccessToken ? config.gitAccessToken : undefined;
  store.addQuestion(store.prompter.createQuestion('Enter your GitHub personal access token: ', 'input', 'gitAccessToken', store.answers.gitAccessToken || defaultToken));
  await store.runQuestions();
};

const getInitialiseGitRemoteTask = () => ({
  type: 'task',
  description: 'intialise git remote',
  // eslint-disable-next-line max-statements
  task: async storeCtx => {
    if (!storeCtx.gitUrl && !storeCtx.gitSSHUrl) {
      try {
        const {
          response,
          printInfo: info,
          printSuccess
        } = await (0, _fetch.fetch)(storeCtx.answers.repoOrg ? `https://api.github.com/orgs/${storeCtx.answers.repoOrg}/repos` : 'https://api.github.com/user/repos', 'POST', JSON.stringify({
          name: storeCtx.answers.projectName,
          description: storeCtx.answers.projectDescription,
          private: storeCtx.answers.privatePackage,
          license_template: storeCtx.answers.projectLicense,
          // eslint-disable-next-line
          auto_init: true,
          // eslint-disable-next-line
          gitignore_template: 'Node'
        }), storeCtx.answers.gitAccessToken, null, true);
        storeCtx.gitUrl = response.git_url;
        storeCtx.gitSSHUrl = response.ssh_url;
        storeCtx.gitHtmlUrl = response.html_url;
        return {
          printInfo: info,
          printSuccess
        };
      } catch ({
        code
      }) {
        // TODO - maybe can resume a project from here? Or maybe not the job
        // of the init function..
        // eslint-disable-next-line
        if (code === 422) {
          throw (0, _error.applifyError)(_errorCodes.REPO_ALREADY_EXISTS.code, `${_errorCodes.REPO_ALREADY_EXISTS.message}: Repository already exists`);
        } // eslint-disable-next-line


        if (code === 401 || code === 403) {
          throw (0, _error.applifyError)(_errorCodes.REPO_AUTH_ERROR.code, `${_errorCodes.REPO_AUTH_ERROR.message}: Invalid access token`);
        }

        throw (0, _error.applifyError)(_errorCodes.REPO_CREATE_ERROR.code, `${_errorCodes.REPO_CREATE_ERROR.message}: Cannot create repository`);
      }
    }

    return {};
  }
});

const getInitialiseGitLocalTask = () => ({
  type: 'task',
  description: 'intialise git locally',
  task: async store => {
    if (!store.gitInitialised) {
      const output = await (0, _execute.execute)({
        cmd: 'git init .',
        info: 'Git init'
      });
      const {
        result
      } = output;

      if (result.stderr) {
        throw (0, _error.applifyError)(_errorCodes.GIT_INIT_ERROR.code, // eslint-disable-next-line
        `${_errorCodes.GIT_INIT_ERROR.message}: failed with ${result.stderr}`);
      }

      store.gitInitialised = true;
      store.gitUpToDate = false;
      return output;
    }

    return {};
  }
});

const getAddGitRemoteTask = () => ({
  type: 'task',
  description: 'add git remote',
  task: async store => {
    if (!store.gitRemoteAdded) {
      const output = await (0, _execute.execute)({
        cmd: `git remote add origin ${store.gitSSHUrl}`,
        info: 'Add git ssh remote'
      }, false);
      store.gitRemoteAdded = true;
      return output;
    }

    return {};
  }
});

const getPullCurrentMasterTask = () => ({
  type: 'task',
  description: 'pull current master',
  task: async store => {
    if (!store.gitUpToDate) {
      await (0, _execute.execute)({
        cmd: `git fetch --all`,
        info: 'Git fetch from remote'
      }, false);
      const output = await (0, _execute.execute)({
        cmd: `git reset --hard origin/master`,
        info: 'Git reset master to remote'
      }, false);
      store.gitUpToDate = true;
      return output;
    }

    return {};
  }
});

const runGitInitialisationTasks = async store => {
  store.addTask({
    type: 'batch',
    description: 'Initialise git repository',
    children: [getInitialiseGitRemoteTask(), getInitialiseGitLocalTask(), getAddGitRemoteTask(), getPullCurrentMasterTask()]
  });
};

const getGitignoreString = () => `
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

const runRewriteGitIgnoreTask = async store => {
  store.addTask({
    type: 'batch',
    description: 'Rewrite .gitignore',
    children: [{
      type: 'task',
      description: 'rewrite .gitignore in project directory',
      task: storeCtx => {
        const gitignore = getGitignoreString();

        _fs.default.writeFileSync(`${storeCtx.workingDir}/.gitignore`, gitignore);

        return {
          printInfo: `Rewrote ${storeCtx.workingDir}/.gitignore`,
          printSuccess: gitignore
        };
      }
    }]
  });
}; // eslint-disable-next-line max-statements


const setStoreNoGit = store => {
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

const parseAndReorderBranches = branches => {
  if (!branches.some(branch => branch === 'master')) {
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
};

const checkoutAndPush = async store => {
  const initialBranches = store.answers.initialBranches;
  const branches = parseAndReorderBranches(Array.isArray(initialBranches) ? initialBranches : initialBranches.split(','));

  for (const branch of branches) {
    const task = {
      type: 'batch',
      description: `Checking out and commiting ${branch}`,
      children: [{
        type: 'task',
        description: `checking out ${branch}`,
        task: async storeCtx => {
          const output = await (0, _execute.execute)({
            cmd: `git checkout -b ${branch}`,
            info: `Git checkout ${branch}`
          }, false);
          return output;
        }
      }, {
        type: 'task',
        description: `adding ${branch} files`,
        task: async storeCtx => {
          const output = await (0, _execute.execute)({
            cmd: 'git add -A',
            info: `Git add ${branch}`
          }, false);
          return output;
        }
      }]
    };

    if (store.answers.useCommitizen) {
      store.addTask(task);
      await store.runTasks();
      await (0, _execute.spawn)({
        cmd: 'npx',
        args: ['git-cz'],
        info: `Commit ${branch} with commitizen standard`
      }, false);
    } else {
      task.children.push({
        type: 'task',
        description: `commiting ${branch}`,
        task: async storeCtx => {
          const output = await (0, _execute.execute)({
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
      children: [{
        type: 'task',
        description: `push changes to ${branch} to remote origin`,
        task: async storeCtx => {
          const output = await (0, _execute.execute)({
            cmd: `git push origin ${branch}`,
            info: `Git push ${branch}`
          });
          return output;
        }
      }]
    });
  }

  await store.runTasks();
};

const setupCommitizen = async store => {
  store.addTask({
    type: 'batch',
    description: 'Install and setup commitizen',
    children: [{
      type: 'task',
      description: 'install commitizen globally',
      task: async storeCtx => {
        const output = storeCtx.packageInstaller.install('commitizen', 'global');
        return output;
      }
    }, {
      type: 'task',
      description: 'install skan-io commit config',
      task: async storeCtx => {
        const output = storeCtx.packageInstaller.install('@skan-io/release-config');
        return output;
      }
    }]
  });
  store.addTask({
    type: 'batch',
    description: 'Rewrite .releaserc',
    children: [{
      type: 'task',
      description: 'rewrite .releaserc (no npm release)',
      task: storeCtx => {
        const releaseFile = (0, _path.join)(storeCtx.workingDir, '.releaserc');
        const releaseJson = JSON.parse(_fs.default.readFileSync(releaseFile, 'utf8'));
        releaseJson.plugins = ['@semantic-release/commit-analyzer', '@semantic-release/release-notes-generator', ['@semantic-release/npm', {
          npmPublish: false
        }], '@semantic-release/github'];
        const releaseString = (0, _strings.stringify)(releaseJson);

        _fs.default.writeFileSync(releaseFile, releaseString);

        return {
          printInfo: `Rewrote ${releaseFile}`,
          printSuccess: releaseString
        };
      }
    }]
  });
  await store.runTasks();
};

const lockDownMasterBranch = async store => {
  store.addTask({
    type: 'batch',
    description: 'Lock down master branch',
    children: [{
      type: 'task',
      description: 'update master branch protection',
      task: async storeCtx => {
        const {
          repoOrg,
          repoOwner,
          projectName,
          useCi,
          ciPlatform,
          repoMaintainers,
          privatePackage
        } = storeCtx.answers;
        const {
          response,
          printInfo,
          printSuccess
        } = await (0, _fetch.fetch)(`https://api.github.com/repos/${repoOrg === undefined || repoOrg === '' || repoOrg === 'none' ? repoOwner : repoOrg}/${projectName}/branches/master/protection`, 'PUT', JSON.stringify({
          required_status_checks: useCi && !privatePackage ? {
            strict: true,
            contexts: [`continuous-integration/${ciPlatform}/pr`, `continuous-integration/${ciPlatform}/push`]
          } : undefined,
          enforce_admins: true,
          required_pull_request_reviews: {
            dismissal_restrictions: repoOrg ? {
              users: [repoOwner]
            } : undefined,
            dismiss_stale_reviews: true,
            // Dont want to lock down branches if only 1 maintainer
            require_code_owner_reviews: (0, _utils.parseArrayString)(repoMaintainers).array.length ? true : false,
            required_approving_review_count: 1
          },
          restrictions: repoOrg ? {
            users: (0, _utils.parseArrayString)(repoMaintainers).array
          } : null
        }), storeCtx.answers.gitAccessToken, 'application/json', 'application/vnd.github.luke-cage-preview+json', true);
        return {
          printInfo,
          printSuccess
        };
      }
    }]
  });
  await store.runTasks();
}; // eslint-disable-next-line max-statements, complexity


const checkRestore = async (store, config) => {
  // TODO requiredConditionals?
  const useGit = {
    question: 'Would you like to use github: ',
    field: 'useGit'
  };
  let restoreSuccess = true;

  if ((0, _utils.expectDefined)(store.answers[useGit.field])) {
    restoreSuccess = (0, _utils.checkFields)(store, 'Source', requiredAnswers, requiredFields);
  } else {
    restoreSuccess = false;
  }

  if (restoreSuccess) {
    (0, _print.printDim)('\n-------- SOURCE DETAILS ---------\n', 'blue');
    (0, _print.printDim)(`${useGit.question} ${store.answers[useGit.field]}`, 'white');

    for (const answer of requiredAnswers) {
      (0, _print.printDim)(`${answer.question} ${store.answers[answer.field]}`, 'white');
    }
  } else {
    // eslint-disable-next-line
    await init(store, config, false);
  }
};

exports.checkRestore = checkRestore;

const init = async (store, config, restore = true) => {
  if (restore && store.completedSteps.some(step => step === 'init:source')) {
    await checkRestore(store, config);
  } else {
    await getShouldUseGit(store);

    if (store.answers.useGit) {
      await getRepoDetails(store, config);
      await getGitAccessToken(store, config);
    }

    store.emit(_events.STEP_COMPLETE, 'init:source');
    store.completedSteps.push('init:source');
  }
};

exports.init = init;

const run = async store => {
  if (!store.completedSteps.some(step => step === 'run:source')) {
    // Run the commitizen setup
    if (store.answers.useGit) {
      await runGitInitialisationTasks(store);
      await runRewriteGitIgnoreTask(store);
    } // The run function will return a promise that will can
    // be resolved after certain events


    return () => new Promise(resolve => {
      // When we have finished running all the steps we can push the
      // setup project to github
      store.on(_events.STORE_RUN, async () => {
        if (store.answers.useGit) {
          (0, _print.printInfo)('\n-------- COMMIT PROJECT ---------\n');

          if (store.answers.useCommitizen) {
            await setupCommitizen(store);
          }

          await checkoutAndPush(store); // Lock down the master branch, set up travis hooks, after first push

          if (store.answers.lockMasterBranch) {
            await lockDownMasterBranch(store);
          }
        }

        store.emit(_events.STEP_COMPLETE, 'run:source');
        store.completedSteps.push('run:source');
        resolve(null);
      });
    });
  }
};

exports.run = run;