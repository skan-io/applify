"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.run = exports.init = exports.checkRestore = exports.requiredAnswers = exports.requiredFields = void 0;

var _events = require("../events");

var _utils = require("./utils");

var _print = require("../print");

const requiredFields = [];
exports.requiredFields = requiredFields;
const requiredAnswers = [{
  question: 'Choose your style: ',
  field: 'styleChoice'
}, {
  question: 'Choose your ui: ',
  field: 'uiChoice'
}, {
  question: 'Would you like to use storybook: ',
  field: 'useStorybook'
}];
exports.requiredAnswers = requiredAnswers;

const getStyleDetails = async store => {
  store.addQuestion(store.prompter.createQuestion('Choose your style language: ', 'list', 'styleChoice', store.answers.styleChoice || 'sass', ['sass', 'css']));
  store.addQuestion(store.prompter.createRuntimeQuestion(() => 'Choose your ui kit: ', () => 'list', () => 'uiChoice', () => store.answers.uiChoice || 'skan-ui', () => store.answers.styleChoice === 'sass' ? ['skan-ui', 'bootstrap/argon', 'material', 'none'] : ['bootstrap', 'material', 'none']));
  store.addQuestion(store.prompter.createQuestion('Would you like to use storybook: ', 'confirm', 'useStorybook', store.answers.useStorybook || true));
  (0, _print.printInfo)('\n-------- UI DETAILS ---------\n');
  await store.runQuestions();
};

const getStorybookDetails = async store => {
  store.addQuestion(store.prompter.createQuestion('Storybook server port: ', 'input', 'storybookServerPort', // eslint-disable-next-line no-magic-numbers
  store.answers.storybookServerPort || 8080));
  await store.runQuestions();
};

const installStorybook = async store => {
  store.addTask({
    type: 'batch',
    description: 'Install storybook dependencies',
    children: [{
      type: 'task',
      description: 'install storybook and storybook addons',
      task: async storeCtx => {
        const output = await storeCtx.packageInstaller.install( // TODO: make this a skan-io config
        // eslint-disable-next-line
        '@storybook/react @storybook/addons @storybook/addon-storyshots @storybook/addon-links @storybook/addon-knobs @storybook/addon-info @storybook/addon-actions');
        storeCtx.storybookInstalled = true;
        return output;
      }
    }]
  });
};

const checkRestore = async store => {
  const restoreSuccess = (0, _utils.checkFields)(store, 'Style', requiredAnswers, requiredFields);

  if (restoreSuccess) {
    (0, _print.printDim)('\n-------- STYLE DETAILS ---------\n', 'blue');

    for (const answer of requiredAnswers) {
      (0, _print.printDim)(`${answer.question} ${store.answers[answer.field]}`, 'white');
    }
  } else {
    // eslint-disable-next-line
    await init(store, undefined, false);
  }
};

exports.checkRestore = checkRestore;

const init = async (store, config, restore = true) => {
  if (restore && store.completedSteps.some(step => step === 'init:style')) {
    await checkRestore(store);
  } else {
    await getStyleDetails(store);

    if (store.answers.useStorybook) {
      await getStorybookDetails(store);
    }
  }

  store.emit(_events.STEP_COMPLETE, 'init:style');
  store.completedSteps.push('init:style');
};

exports.init = init;

const run = async store => {
  if (!store.completedSteps.some(step => step === 'run:style')) {
    if (store.answers.useStorybook) {
      await installStorybook(store);
    }
  }

  store.emit(_events.STEP_COMPLETE, 'run:style');
  store.completedSteps.push('run:style');
  return () => Promise.resolve(null);
};

exports.run = run;