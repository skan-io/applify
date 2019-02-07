import {prompt} from 'inquirer';
import {START_QUESTION, END_QUESTION} from '../events';

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
export const buildQuestions = (questions)=> questions;


// Standard prompt questions function used by the store
export const runQuestions = async (questions, store)=> {
  for (const question of questions) {
    store.emit(START_QUESTION, question);
    const answer = await prompt(question);
    // Update the store with new answers
    store.answers = store.answers ? {...store.answers, ...answer} : answer;
    store.emit(END_QUESTION, question);
  }
};

// THIS IS A NON-STANDARD FUNCTION AND IS NOT GARUANTEED TO BE USEFUL
// TO PLUGIN BUILDERS
// eslint-disable-next-line max-params
export const createQuestion =
  // eslint-disable-next-line
  (question, type, value, defaultValue, choices=[])=> ({
    message: question,
    type,
    default: defaultValue,
    name: value,
    choices
  });
