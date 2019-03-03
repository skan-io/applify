"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = exports.init = exports.checkRestore = exports.requiredFields = exports.requiredAnswers = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = require("path");

var _events = require("../events");

var _print = require("../print");

var _utils = require("./utils");

var _createWebpackConfig = require("./create-webpack-config");

const requiredAnswers = [{
  question: 'Entry points (module names): ',
  field: 'buildEntries'
}, {
  question: 'Output directory: ',
  field: 'buildOutputPath'
}, {
  question: 'Development server port: ',
  field: 'devServerPort'
}, {
  question: 'Favicon url: ',
  field: 'faviconUrl'
}];
exports.requiredAnswers = requiredAnswers;
const requiredFields = [];
exports.requiredFields = requiredFields;

const getBuildDetails = async store => {
  store.addQuestion(store.prompter.createQuestion('Entry points (comma separated): ', 'input', 'buildEntries', store.answers.buildEntries || 'index.html.js'));
  store.addQuestion(store.prompter.createQuestion('Output directory: ', 'input', 'buildOutputPath', store.answers.buildOutputPath || 'build/pkg'));
  store.addQuestion(store.prompter.createQuestion('Development server port: ', 'input', 'devServerPort', store.answers.devServerPort || '8080'));
  store.addQuestion(store.prompter.createQuestion('Favicon url: ', 'input', 'faviconUrl', store.answers.faviconUrl || 'favicon.png'));
  (0, _print.printInfo)('\n-------- BUILD DETAILS ---------\n');
  await store.runQuestions();
};

const runWebpackSetupTasks = async store => {
  store.addTask({
    type: 'batch',
    description: 'Install webpack dependencies',
    children: [{
      type: 'task',
      description: 'install skan-io webpack config ',
      task: async storeCtx => {
        if (!storeCtx.webpackInstalled) {
          const output = await storeCtx.packageInstaller.install('@skan-io/webpack-config-base');

          if (output.result.stderr) {
            storeCtx.webpackInstalled = false;
          } else {
            storeCtx.webpackInstalled = true;
          }

          return output;
        }

        return {};
      }
    }]
  });
};

const createWriteWebpackConfigTask = async store => {
  store.addTask({
    type: 'batch',
    description: 'Write weback config',
    children: [{
      type: 'task',
      description: 'write webpack.config.babel.js file',
      task: storeCtx => {
        const webpackPath = (0, _path.join)(storeCtx.workingDir, 'webpack.config.babel.js');
        const webpackConfig = (0, _createWebpackConfig.createWebpackConfig)(store);

        _fs.default.writeFileSync(webpackPath, webpackConfig);

        return {
          printInfo: `Wrote ${webpackPath}`,
          printSuccess: webpackConfig
        };
      }
    }]
  });
}; // eslint-disable-next-line max-statements


const checkRestore = async store => {
  const restoreSuccess = (0, _utils.checkFields)(store, 'Build', requiredAnswers, requiredFields);

  if (restoreSuccess) {
    (0, _print.printDim)('\n-------- BUILD DETAILS ---------\n', 'blue');

    for (const answer of requiredAnswers) {
      (0, _print.printDim)(`${answer.question} ${store.answers[answer.field]}`, 'white');
    }
  } else {
    // eslint-disable-next-line
    await init(store);
  }
};

exports.checkRestore = checkRestore;

const init = async store => {
  if (store.completedSteps.some(step => step === 'init:build')) {
    await checkRestore(store);
  } else {
    await getBuildDetails(store);
    store.emit(_events.STEP_COMPLETE, 'init:build');
    store.completedSteps.push('init:build');
  }
};

exports.init = init;

const run = async store => {
  if (!store.completedSteps.some(step => step === 'run:build')) {
    await runWebpackSetupTasks(store);
    await createWriteWebpackConfigTask(store);
  }

  store.emit(_events.STEP_COMPLETE, 'run:build');
  store.completedSteps.push('run:build');
  return () => Promise.resolve(null);
};

exports.run = run;