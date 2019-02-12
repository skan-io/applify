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
// eslint-disable-next-line
export const buildQuestions = (questions, store)=> questions;


// Standard prompt questions function used by the store
export const runQuestions = async (questions, store)=> {
  for (const question of questions) {
    let answer = null;
    store.emit(START_QUESTION, question);


    if (typeof question === 'function') {
      // Runtime question parameters
      answer = await prompt(question(store));
    } else {
      answer = await prompt(question);
    }

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

// Similar to above but allows for creating of question variables at runtime
export const createRuntimeQuestion =
  // eslint-disable-next-line
  (question, type, value, defaultValue, choices=()=>[])=> (store)=> ({
    message: question(store),
    type: type(store),
    default: defaultValue(store),
    name: value(store),
    choices: choices(store)
  });
