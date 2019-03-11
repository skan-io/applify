import {prompt} from 'inquirer';
import {START_QUESTION, END_QUESTION} from '../events';

/*
  The `prompter` operator plugin will contain `buildQuestions` and
  `runQuestions` functions.  The `buildQuestions` function will take an
  array of question objects (or whatever model the plugin writer chooses)
  and will output a conformant set of questions that can by run by the
  `runQuestions` function.
 */

export default class ApplifyPromptPlugin {
  buildQuestions(questions /* , store */) {
    return questions;
  }

  async runQuestions(questions, store) {
    for (const question of questions) {
      let answer = null;
      store.emit(START_QUESTION, question);

      // Provides a 'runtimeQuestion' functionality where question
      // parameters can be evaluated at runtime as opposed to
      // needing to be hard coded
      if (typeof question === 'function') {
        answer = await prompt(await question(store));
      } else {
        answer = await prompt(question);
      }

      // Update the store with new answers
      store.answers = store.answers ? {...store.answers, ...answer} : answer;
      store.emit(END_QUESTION, question);
    }
  }

  // eslint-disable-next-line max-params
  createQuestion(
      question, type, value, defaultValue, choices=[], validate=()=> true
  ) {
    return {
      message: question,
      type,
      default: defaultValue,
      name: value,
      choices,
      validate
    };
  }

  // eslint-disable-next-line max-params
  createRuntimeQuestion(
      question, type, value, defaultValue,
      choices=()=> [], validate=()=> ()=> true
  ) {
    return async (store)=> ({
      message: await question(store),
      type: await type(store),
      default: await defaultValue(store),
      name: await value(store),
      choices: await choices(store),
      validate: await validate(store)
    });
  }
}
