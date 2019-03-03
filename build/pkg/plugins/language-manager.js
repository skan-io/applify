"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = exports.init = exports.checkRestore = exports.requiredAnswers = exports.requiredFields = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = require("path");

var _events = require("../events");

var _print = require("../print");

var _utils = require("./utils");

var _createBabelConfig = require("./create-babel-config");

var _createEslintConfig = require("./create-eslint-config");

const requiredFields = [];
exports.requiredFields = requiredFields;
const requiredAnswers = [{
  question: 'Node target: ',
  field: 'nodeTarget'
}, {
  question: 'Browser targets (comma seperated): ',
  field: 'browserTargets'
}, {
  question: 'Would you like to add extra babel plugins: ',
  field: 'babelPlugins'
}, {
  question: 'Would you like to use redux: ',
  field: 'useRedux'
}, {
  question: 'Would you like to use router: ',
  field: 'useRouter'
}, {
  question: 'Would you like to use eslint: ',
  field: 'useEslint'
}];
exports.requiredAnswers = requiredAnswers;

const getBabelDetails = async store => {
  store.addQuestion(store.prompter.createQuestion('Node target: ', 'input', 'nodeTarget', store.answers.nodeTarget || 'current'));
  store.addQuestion(store.prompter.createQuestion('Browser targets (comma seperated): ', 'input', 'browserTargets', store.answers.browserTargets || 'last 2 versions, not IE < 11'));
  store.addQuestion(store.prompter.createQuestion('Would you like to add extra babel plugins: ', 'input', 'babelPlugins', store.answers.babelPlugins || 'none'));
  (0, _print.printInfo)('\n-------- LANGUAGE DETAILS ---------\n');
  await store.runQuestions();
};

const getReduxDetails = async store => {
  store.addQuestion(store.prompter.createQuestion('Would you like to use redux: ', 'confirm', 'useRedux', store.answers.useRedux || true));
  await store.runQuestions();
};

const getRouterDetails = async store => {
  store.addQuestion(store.prompter.createQuestion('Would you like to use router: ', 'confirm', 'useRouter', store.answers.useRouter || false));
  await store.runQuestions();
};

const getLinterDetails = async store => {
  store.addQuestion(store.prompter.createQuestion('Would you like to use eslint: ', 'confirm', 'useEslint', store.answers.useEslint || true));
  await store.runQuestions();
}; // eslint-disable-next-line max-statements


const runLanguageInstallTasks = async store => {
  const task = {
    type: 'batch',
    description: 'Install core language dependencies',
    children: [{
      type: 'task',
      description: 'install skan-io babel react config',
      task: async storeCtx => {
        if (!storeCtx.babelInstalled) {
          const output = await storeCtx.packageInstaller.install( // TODO @skan-io/babel-config-react
          '@skan-io/babel-config-react');
          storeCtx.babelInstalled = true;
          return output;
        }

        return {};
      }
    }]
  };

  if (store.answers.babelPlugins !== 'none' && store.answers.babelPlugins !== '') {
    const plugins = (0, _utils.parseArrayString)(store.answers.babelPlugins);

    if (plugins.array.length) {
      task.children.push({
        type: 'task',
        description: 'install extra babel plugins',
        task: async storeCtx => {
          const output = await storeCtx.packageInstaller.install(plugins.string);
          return output;
        }
      });
    }
  }

  task.children.push({
    type: 'task',
    description: 'install react dependencies',
    task: async storeCtx => {
      if (!storeCtx.reactInstalled) {
        const output = await storeCtx.packageInstaller.install('react react-dom react-device');
        storeCtx.reactInstalled = true;
        return output;
      }

      return {};
    }
  });

  if (store.answers.useRedux) {
    task.children.push({
      type: 'task',
      description: 'install redux dependencies',
      task: async storeCtx => {
        if (!storeCtx.reduxInstalled) {
          const output = await storeCtx.packageInstaller.install('react-redux redux redux-responsive redux-thunk');
          storeCtx.reduxInstalled = true;
          return output;
        }

        return {};
      }
    });
  }

  if (store.answers.useRouter) {
    task.children.push({
      type: 'task',
      description: 'install router dependencies',
      task: async storeCtx => {
        if (!storeCtx.routerInstalled) {
          const output = await storeCtx.packageInstaller.install( // eslint-disable-next-line
          `react-router ${storeCtx.answers.useRedux ? 'connected-react-router' : ''}`);
          storeCtx.routerInstalled = true;
          return output;
        }

        return {};
      }
    });
  }

  if (store.answers.useEslint) {
    task.children.push({
      type: 'task',
      description: 'install skan-io eslint react config',
      task: async storeCtx => {
        if (!storeCtx.eslintInstalled) {
          const output = await storeCtx.packageInstaller.install('@skan-io/eslint-config-react');
          storeCtx.eslintInstalled = true;
          return output;
        }

        return {};
      }
    });
  }

  task.children.push({
    type: 'task',
    description: 'install skan-io markdown lint config',
    task: async storeCtx => {
      const output = await storeCtx.packageInstaller.install('@skan-io/remark-config');
      return output;
    }
  });
  store.addTask(task);
};

const createWriteBabelConfigTask = async store => {
  store.addTask({
    type: 'batch',
    description: 'Write babel config',
    children: [{
      type: 'task',
      description: 'configure babel config using store',
      task: storeCtx => {
        const babelPath = (0, _path.join)(storeCtx.workingDir, 'babel.config.js');
        const babelConfig = (0, _createBabelConfig.createBabelConfig)(store);

        _fs.default.writeFileSync(babelPath, babelConfig);

        return {
          printInfo: `Wrote ${babelPath}`,
          printSuccess: babelConfig
        };
      }
    }]
  });
};

const createWriteEslintConfigTask = async store => {
  store.addTask({
    type: 'batch',
    description: 'Write eslint config',
    children: [{
      type: 'task',
      description: 'write .eslintrc file',
      task: storeCtx => {
        const eslintPath = (0, _path.join)(storeCtx.workingDir, '.eslintrc');
        const eslintConfig = (0, _createEslintConfig.createEslintConfig)();

        _fs.default.writeFileSync(eslintPath, eslintConfig);

        return {
          printInfo: `Wrote ${eslintPath}`,
          printSuccess: eslintConfig
        };
      }
    }]
  });
};

const checkRestore = async store => {
  const restoreSuccess = (0, _utils.checkFields)(store, 'Language', requiredAnswers, requiredFields);

  if (restoreSuccess) {
    (0, _print.printDim)('\n-------- LANGUAGE DETAILS ---------\n', 'blue');

    for (const answer of requiredAnswers) {
      (0, _print.printDim)(`${answer.question} ${store.answers[answer.field]}`, 'white');
    }
  } else {
    // eslint-disable-next-line
    await init(store, undefined, false);
  }
}; // eslint-disable-next-line max-statements


exports.checkRestore = checkRestore;

const init = async (store, config, restore = true) => {
  if (restore && store.completedSteps.some(step => step === 'init:language')) {
    await checkRestore(store);
  } else {
    await getBabelDetails(store);
    await getReduxDetails(store);
    await getRouterDetails(store);
    await getLinterDetails(store);

    if (!store.answers.useRedux) {
      store.reduxInstalled = false;
    }

    if (!store.answers.useRouter) {
      store.routerInstalled = false;
    }

    if (!store.answers.useEslint) {
      store.eslintInstalled = false;
    }

    store.emit(_events.STEP_COMPLETE, 'init:language');
    store.completedSteps.push('init:language');
  }
};

exports.init = init;

const run = async store => {
  if (!store.completedSteps.some(step => step === 'run:language')) {
    await runLanguageInstallTasks(store);
    await createWriteBabelConfigTask(store);

    if (store.answers.useEslint) {
      await createWriteEslintConfigTask(store);
    }
  }

  store.emit(_events.STEP_COMPLETE, 'run:language');
  store.completedSteps.push('run:language');
  return () => Promise.resolve(null);
};

exports.run = run;