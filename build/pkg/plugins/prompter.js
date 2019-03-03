"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRuntimeQuestion = exports.createQuestion = exports.runQuestions = exports.buildQuestions = void 0;

var _inquirer = require("inquirer");

var _events = require("../events");

/*
  The `prompter` operator plugin will contain `buildQuestions` and
  `runQuestions` functions.  The `buildQuestions` function will take an
  array of question objects (or whatever model the plugin writer chooses)
  and will output a conformant set of questions that can by run by the
  `runQuestions` function.
 */
// Standard build questions function used by the store, except we dont need
// to do anything because we use the `createQuestion` helper across our
// default plugins
// eslint-disable-next-line
const buildQuestions = (questions, store) => questions; // Standard prompt questions function used by the store


exports.buildQuestions = buildQuestions;

const runQuestions = async (questions, store) => {
  for (const question of questions) {
    let answer = null;
    store.emit(_events.START_QUESTION, question);

    if (typeof question === 'function') {
      // Runtime question parameters
      answer = await (0, _inquirer.prompt)((await question(store)));
    } else {
      answer = await (0, _inquirer.prompt)(question);
    } // Update the store with new answers


    store.answers = store.answers ? { ...store.answers,
      ...answer
    } : answer;
    store.emit(_events.END_QUESTION, question);
  }
}; // THIS IS A NON-STANDARD FUNCTION AND IS NOT GARUANTEED TO BE USEFUL
// TO PLUGIN BUILDERS
// eslint-disable-next-line max-params


exports.runQuestions = runQuestions;

const createQuestion = // eslint-disable-next-line
(question, type, value, defaultValue, choices = []) => ({
  message: question,
  type,
  default: defaultValue,
  name: value,
  choices
}); // Similar to above but allows for creating of question variables at runtime


exports.createQuestion = createQuestion;

const createRuntimeQuestion = // eslint-disable-next-line
(question, type, value, defaultValue, choices = () => []) => async store => ({
  message: await question(store),
  type: await type(store),
  default: await defaultValue(store),
  name: await value(store),
  choices: await choices(store)
});

exports.createRuntimeQuestion = createRuntimeQuestion;