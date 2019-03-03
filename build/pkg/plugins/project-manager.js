"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = exports.init = exports.checkRestore = exports.requiredFields = exports.requiredAnswers = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = require("path");

var _execute = require("../execute");

var _error = require("../error");

var _errorCodes = require("../error/error-codes");

var _print = require("../print");

var _events = require("../events");

var _utils = require("./utils");

var _createReadme = require("./create-readme");

const NPM_VERSION_MIN = '6';
const YARN_VERSION_MIN = '1';
const NODE_VERSION_MIN = 'v10';
const requiredAnswers = [{
  question: 'Use npm or yarn: ',
  field: 'packageManager'
}, {
  question: 'What is the project name: ',
  field: 'projectName'
}, {
  question: 'What is the project scope: ',
  field: 'orgScope'
}, {
  question: 'What is the project description: ',
  field: 'projectDescription'
}, {
  question: 'What is the project license: ',
  field: 'projectLicense'
}, {
  question: 'Who is the project author: ',
  field: 'projectAuthor'
}, {
  question: 'Is this a private project: ',
  field: 'privatePackage'
}];
exports.requiredAnswers = requiredAnswers;
const requiredFields = ['nodeVersionConfirmed', 'packageManagerVersionConfirmed'];
exports.requiredFields = requiredFields;

const getEnvironmentDetails = async store => {
  store.addQuestion(store.prompter.createQuestion('Use npm or yarn: ', 'list', 'packageManager', 'npm', ['npm', 'yarn']));
  await store.runQuestions();
};

const getNodeVersionCheckTask = () => ({
  type: 'task',
  description: 'checking node version',
  task: async ctx => {
    const output = await (0, _execute.execute)({
      cmd: 'node -v',
      info: 'Node version'
    });
    const {
      result
    } = output;

    if (!result.stdout.startsWith(NODE_VERSION_MIN)) {
      throw (0, _error.applifyError)(_errorCodes.NODE_VERSION_ERROR.code, // eslint-disable-next-line
      `${_errorCodes.NODE_VERSION_ERROR.message}: failed with ${result.stdout} (must be v10+)`);
    }

    if (result.stderr) {
      throw (0, _error.applifyError)(_errorCodes.NODE_VERSION_ERROR.code, // eslint-disable-next-line
      `${_errorCodes.NODE_VERSION_ERROR.message}: failed with ${result.stderr}`);
    }

    ctx.nodeVersionConfirmed = true;
    return output;
  }
});

const runNpmCheck = async () => {
  const output = await (0, _execute.execute)({
    cmd: 'npm -v',
    info: 'NPM version'
  });
  const {
    result
  } = output;

  if (!result.stdout.startsWith(NPM_VERSION_MIN)) {
    throw (0, _error.applifyError)(_errorCodes.PKGMGR_VERSION_ERROR.code, // eslint-disable-next-line
    `${_errorCodes.PKGMGR_VERSION_ERROR.message}: failed with ${result.stdout} (must be v6+)`);
  }

  if (result.stderr) {
    throw (0, _error.applifyError)(_errorCodes.PKGMGR_VERSION_ERROR.code, // eslint-disable-next-line
    `${_errorCodes.PKGMGR_VERSION_ERROR.message}: failed with ${result.stderr}`);
  }

  return output;
};

const runYarnCheck = async () => {
  const output = await (0, _execute.execute)({
    cmd: 'yarn -v',
    info: 'Yarn version'
  });
  const {
    result
  } = output;

  if (!result.stdout.startsWith(YARN_VERSION_MIN)) {
    throw (0, _error.applifyError)(_errorCodes.PKGMGR_VERSION_ERROR.code, // eslint-disable-next-line
    `${_errorCodes.PKGMGR_VERSION_ERROR.message}: failed with ${result.stdout} (must be v1+)`);
  }

  if (result.stderr) {
    throw (0, _error.applifyError)(_errorCodes.PKGMGR_VERSION_ERROR.code, // eslint-disable-next-line
    `${_errorCodes.PKGMGR_VERSION_ERROR.message}: failed with ${result.stderr}`);
  }

  return output;
};

const getPackageManagerCheckTask = store => ({
  type: 'task',
  description: `checking ${store.answers.packageManager} version`,
  task: async ctx => {
    let output = null;
    const {
      packageManager
    } = store.answers;

    if (packageManager === 'npm') {
      output = await runNpmCheck();
    }

    if (packageManager === 'yarn') {
      output = await runYarnCheck();
    }

    ctx.packageManagerVersionConfirmed = true;
    return output;
  }
}); // eslint-disable-next-line


const checkEnvironment = async store => {
  store.addTask({
    type: 'batch',
    description: 'Checking shell environment',
    children: [getNodeVersionCheckTask(), getPackageManagerCheckTask(store)]
  });
  await store.runTasks();
}; // eslint-disable-next-line


const getProjectDetails = async store => {
  store.addQuestion(store.prompter.createQuestion('What is the project name: ', 'input', 'projectName', // eslint-disable-next-line
  process.cwd().split(_path.sep).pop()));
  store.addQuestion(store.prompter.createQuestion('What is the project scope: ', 'input', 'orgScope', // eslint-disable-next-line
  'none'));
  store.addQuestion(store.prompter.createRuntimeQuestion(() => 'What is the project description:', () => 'input', () => 'projectDescription', storeCtx => storeCtx.answers.projectDescription || `A react boilerplate application for ${storeCtx.answers.projectName}`));
  store.addQuestion(store.prompter.createQuestion('What is the project license: ', 'list', 'projectLicense', store.answers.projectLicense || 'MIT', ['MIT', 'ISC', 'Apache-2.0', 'GPL-3.0', 'BSD-2-clause', 'BSD-3-clause', 'CC', 'WTFPL', 'UNLICENSE']));
  store.addQuestion(store.prompter.createRuntimeQuestion(() => 'Who is the project author: ', () => 'input', () => 'projectAuthor', async storeCtx => {
    try {
      const {
        result
      } = await (0, _execute.execute)({
        cmd: 'npm profile get fullname',
        info: 'Get npm profile name'
      });
      return storeCtx.answers.projectAuthor || result.stdout.replace(/(\r\n|\n|\r)/gm, '');
    } catch (_unused) {
      return undefined;
    }
  }));
  store.addQuestion(store.prompter.createQuestion('Is this a private project: ', 'confirm', 'privatePackage', store.answers.privatePackage || true));
  (0, _print.printInfo)('\n-------- PROJECT DETAILS ---------\n');
  await store.runQuestions();
};

const createSrcDirectory = async store => {
  store.addTask({
    type: 'batch',
    description: 'Create src directory',
    children: [{
      type: 'task',
      description: 'find or create src directory',
      task: storeCtx => {
        const {
          appSrcDir
        } = storeCtx;
        let printSuccess = `Found ${appSrcDir}`;

        if (!_fs.default.existsSync(appSrcDir)) {
          _fs.default.mkdirSync(appSrcDir);

          printSuccess = `Created ${appSrcDir}`;
        }

        return {
          printInfo: `Find or create local scripts directory`,
          printSuccess
        };
      }
    }]
  }); // await store.runTasks();
}; // eslint-disable-next-line max-statements


const checkRestore = async store => {
  const restoreSuccess = (0, _utils.checkFields)(store, 'Project', requiredAnswers, requiredFields);

  if (restoreSuccess) {
    (0, _print.printDim)('\n-------- PROJECT DETAILS ---------\n', 'blue');

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
  if (restore && store.completedSteps.some(step => step === 'init:project')) {
    await checkRestore(store);
  } else {
    await getEnvironmentDetails(store);
    await checkEnvironment(store);
    await getProjectDetails(store);
    store.emit(_events.STEP_COMPLETE, 'init:project');
    store.completedSteps.push('init:project');
  }
};

exports.init = init;

const run = async store => {
  if (!store.completedSteps.some(step => step === 'run:project')) {
    await (0, _createReadme.createReadme)(store);
    await createSrcDirectory(store);
  }

  store.emit(_events.STEP_COMPLETE, 'run:project');
  store.completedSteps.push('run:project');
  return () => Promise.resolve(null);
};

exports.run = run;