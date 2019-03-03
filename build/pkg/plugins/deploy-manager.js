"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = exports.init = exports.checkRestore = exports.requiredFields = exports.requiredAnswers = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = require("path");

var _opn = _interopRequireDefault(require("opn"));

var _print = require("../print");

var _events = require("../events");

var _fetch = require("../fetch");

var _utils = require("./utils");

var _createTravisConfig = require("./create-travis-config");

const requiredAnswers = [{
  question: 'Use CI: ',
  field: 'useCi'
}, {
  question: 'Choose your CI platform: ',
  field: 'ciPlatform'
}, {
  question: 'What is the deployment environment (app url): ',
  field: 'deployEnv'
}, {
  question: 'What is the deployment path (app route): ',
  field: 'deployPath'
}];
exports.requiredAnswers = requiredAnswers;
const requiredFields = [];
exports.requiredFields = requiredFields;

const getUseCi = async store => {
  store.addQuestion(store.prompter.createQuestion('Use CI: ', 'confirm', 'useCi', store.answers.useCi || true));
  (0, _print.printInfo)('\n-------- DEPLOYMENT DETAILS ---------\n', 'blue');
  await store.runQuestions();
};

const getCiPlatformDetails = async store => {
  store.addQuestion(store.prompter.createQuestion('Choose your CI platform: ', 'list', 'ciPlatform', store.answers.ciPlatform || 'travis-ci', ['travis-ci', 'circle-ci', 'codebuild']));
  await store.runQuestions();
};

const getDeployDetails = async store => {
  store.addQuestion(store.prompter.createQuestion('What is the deployment environment (app url): ', 'input', 'deployEnv', store.answers.deploymentEnv));
  store.addQuestion(store.prompter.createQuestion('What is the deployment path (app route): ', 'input', 'deployPath', store.answers.deploymentPath));
  await store.runQuestions();
};

const createWriteCIConfigTask = async store => {
  if (store.answers.ciPlatform === 'travis-ci') {
    store.addTask({
      type: 'batch',
      description: 'Write travis config',
      children: [{
        type: 'task',
        description: 'Write travis.yml file',
        task: storeCtx => {
          const travisPath = (0, _path.join)(storeCtx.workingDir, '.travis.yml');
          const travisConfig = (0, _createTravisConfig.createTravisConfig)(store);

          _fs.default.writeFileSync(travisPath, travisConfig);

          return {
            printInfo: `Wrote ${travisPath}`
          };
        }
      }]
    });
  } // TODO other CI tools

};

const activeTravisApp = async store => {
  store.addTask({
    type: 'batch',
    description: 'Activate Travis CI Github App',
    children: [{
      type: 'task',
      description: 'open travis for activation',
      task: () => {
        (0, _opn.default)('https://travis-ci.com/account/repositories');
        return {
          printInfo: 'Opened https://travis-ci.com/account/repositories for activation'
        };
      }
    }]
  });
  store.addQuestion(store.prompter.createQuestion('Travis Github App activated: ', 'confirm', 'travisActivated', store.answers.travisActivated || true));
  await store.runTasks();
  await store.runQuestions();
};

const getTravisAccessToken = async store => {
  store.addTask({
    type: 'batch',
    description: 'Get Travis CI auth token',
    children: [{
      type: 'task',
      description: 'Exchange git token for travis token',
      task: async storeCtx => {
        const {
          privatePackage
        } = storeCtx.answers;
        const endpoint = privatePackage ? 'travis-ci.com' : 'travis-ci.org';
        const {
          response,
          printInfo: info,
          printSuccess
        } = await (0, _fetch.fetchWithHeaders)(`https://api.${endpoint}/auth/github`, 'POST', JSON.stringify({
          // eslint-disable-next-line
          github_token: storeCtx.answers.gitAccessToken
        }), {
          ['User-Agent']: 'MyClient/1.0.0',
          Accept: 'application/vnd.travis-ci.2.1+json',
          Host: `api.${endpoint}`,
          ['Content-Type']: 'application/json',
          ['Content-Length']: 37
        }, true);
        storeCtx.answers.travisAccessToken = response.access_token;
        return {
          printInfo: info,
          printSuccess
        };
      }
    }]
  });
};

const checkForSynced = async store => {
  let isSyncing = true;
  const {
    privatePackage
  } = store.answers;
  const endpoint = privatePackage ? 'travis-ci.com' : 'travis-ci.org';

  while (isSyncing) {
    const {
      response
    } = await (0, _fetch.fetchWithHeaders)(`https://api.${endpoint}/users/sync`, 'POST', undefined, {
      ['User-Agent']: 'MyClient/1.0.0',
      Accept: 'application/vnd.travis-ci.2.1+json',
      Host: `api.${endpoint}`,
      Authorization: `token ${store.answers.travisAccessToken}`
    }, false // dont throw
    );
    isSyncing = response ? response.is_syncing : true;
  }
};

const syncUserWithTravis = async store => {
  store.addTask({
    type: 'batch',
    description: 'Sync Travis CI with Github',
    children: [{
      type: 'task',
      // eslint-disable-next-line max-len
      description: `sync git user with ${store.answers.privatePackage ? 'travis-ci.com' : 'travis-ci.org'}`,
      task: async storeCtx => {
        const {
          privatePackage
        } = storeCtx.answers;
        const endpoint = privatePackage ? 'travis-ci.com' : 'travis-ci.org';
        const {
          printInfo: info,
          printSuccess
        } = await (0, _fetch.fetchWithHeaders)(`https://api.${endpoint}/users/sync`, 'POST', undefined, {
          ['User-Agent']: 'MyClient/1.0.0',
          Accept: 'application/vnd.travis-ci.2.1+json',
          Host: `api.${endpoint}`,
          Authorization: `token ${storeCtx.answers.travisAccessToken}`
        }, false);
        await checkForSynced(storeCtx);
        return {
          printInfo: info,
          printSuccess
        };
      }
    }]
  });
};

const switchOnRepositoryInTravis = async store => {
  store.addTask({
    type: 'batch',
    description: 'Switch on repository in Travis CI',
    children: [{
      type: 'task',
      description: 'get travis repo id',
      task: async storeCtx => {
        const {
          projectName,
          repoOwner,
          repoOrg
        } = storeCtx.answers;
        const owner = repoOrg ? repoOrg : repoOwner;
        const {
          privatePackage
        } = storeCtx.answers;
        const endpoint = privatePackage ? 'travis-ci.com' : 'travis-ci.org';
        const {
          response,
          printInfo: info,
          printSuccess
        } = await (0, _fetch.fetchWithHeaders)(`https://api.${endpoint}/repos/${owner}/${projectName}`, 'GET', undefined, {
          ['User-Agent']: 'MyClient/1.0.0',
          Accept: 'application/vnd.travis-ci.2.1+json',
          Host: `api.${endpoint}`,
          Authorization: `token ${storeCtx.answers.travisAccessToken}`
        }, true);
        storeCtx.travisRepoId = response.repo.id;
        return {
          printInfo: info,
          printSuccess
        };
      }
    }, {
      type: 'task',
      description: 'switch ci on for repo',
      task: async storeCtx => {
        const {
          privatePackage
        } = storeCtx.answers;
        const endpoint = privatePackage ? 'travis-ci.com' : 'travis-ci.org';
        const {
          printInfo: info,
          printSuccess
        } = await (0, _fetch.fetchWithHeaders)(`https://api.${endpoint}/hooks`, 'PUT', JSON.stringify({
          hook: {
            id: storeCtx.travisRepoId,
            active: true
          }
        }), {
          ['User-Agent']: 'MyClient/1.0.0',
          Accept: 'application/vnd.travis-ci.2.1+json',
          Host: `api.${endpoint}`,
          Authorization: `token ${storeCtx.answers.travisAccessToken}`,
          ['Content-Type']: 'application/json'
        }, true);
        return {
          printInfo: info,
          printSuccess
        };
      }
    }]
  });
};

const hookUpCi = async store => {
  if (store.answers.ciPlatform === 'travis-ci') {
    if (store.answers.travisActivated) {
      await getTravisAccessToken(store);
      await syncUserWithTravis(store);
      await switchOnRepositoryInTravis(store);
    }
  } // TODO other CI tools

}; // eslint-disable-next-line max-statements


const checkRestore = async store => {
  const restoreSuccess = (0, _utils.checkFields)(store, 'Project', requiredAnswers, requiredFields);

  if (restoreSuccess) {
    (0, _print.printDim)('\n-------- DEPLOYMENT DETAILS ---------\n', 'blue');

    for (const answer of requiredAnswers) {
      (0, _print.printDim)(`${answer.question} ${store.answers[answer.field]}`, 'white');
    }
  } else {
    // eslint-disable-next-line
    await init(store, undefined, false);
  }
}; // Initialise the project details, check for package manager,
// check node version


exports.checkRestore = checkRestore;

const init = async (store, config, restore = true) => {
  if (restore && store.completedSteps.some(step => step === 'init:deploy')) {
    await checkRestore(store);
  } else {
    if (store.answers.useGit) {
      await getUseCi(store);

      if (store.answers.useCi) {
        await getCiPlatformDetails(store);
        await getDeployDetails(store);
      }
    } else {
      store.answers.useCi = false;
      store.answers.ciPlatform = null;
      await getDeployDetails(store);
    }

    store.emit(_events.STEP_COMPLETE, 'init:deploy');
    store.completedSteps.push('init:deploy');
  }
};

exports.init = init;

const run = async store => {
  if (!store.completedSteps.some(step => step === 'run:deploy')) {
    if (store.answers.useCi && store.answers.useGit) {
      await store.runTasks();
      (0, _print.printInfo)('\n-------- CI / DEPLOY SETUP ---------\n', 'blue');
      await createWriteCIConfigTask(store);
      await hookUpCi(store);
    }
  } // store.emit(STEP_COMPLETE, 'run:deploy');
  // store.completedSteps.push('run:deploy');


  return () => Promise.resolve(null);
};

exports.run = run;