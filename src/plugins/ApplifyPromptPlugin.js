import EventEmitter from 'events';
import {prompt} from 'inquirer';

/* eslint no-underscore-dangle: 0 */


/*
  Note all plugins have init(config, pipe), getPipe(), and setPipe(pipe)
  funtions.  They may also have an optional run(context, task)
  function if needed. Any other runnable functions must also include context
  and task as their first parameters.  These extra functions will be checked
  agains the plugins internal `_runnable` map.  Other runnable functions are not
  specifically part of the plugin API so are managed at your own risk.

  The plugins will talk to each other via the various pipe and config
  objects. The pipe can hold event emitters only (mutation is to happen within
  the plugins).
 */


/**
 * An event emitter prompt plugin.  Initialise the plugin with a pipe object.
 * The plugin will attach a prompt EventEmitter, that will listen for
 * 'question' and 'ask' events, and will emit a 'response' event.
 *
 * The 'question' event will add a question to the pending questions list.
 * The 'ask' event will trigger all the questions to be asked.
 * The 'response' will be emitted with an answer for the given question id.
 *
 * Example:
 * ```js
 * const promptPlugin = new ApplifyPromptPlugin();
 * const config = {};
 * const pipe = {};
 *
 * await promptPlugin.init(config, pipe);
 *
 * pipe.prompt.emit('question', uuid, 'myQuestion', 'Some question?');
 * pipe.prompt.on('response', (questionId, questionValue, answer)=> {
 *  // questionId: uuid
 *  // questionValue: 'myQuestion'
 *  // answer: 'user input'
 * })
 * pipe.prompt.emit('ask');
 * ```
 *
 * @event question id question
 * @event ask
 * @emit  response id answers
 * @extends EventEmitter
 */
class ApplifyPromptPlugin extends EventEmitter {
  constructor(opts) {
    super(opts.debug);

    this.questions = [];
    this.answers = [];
    this.questionMap = new Map();

    // This plugin has NO runnable functions
    this._runnable = {};

    if (opts) {
      this.debug = opts.debug === undefined ? false : opts.debug;
    } else {
      this.debug = false;
    }

    if (global.log) {
      this.debug = true;
    }
  }

  /**
   * Prompt the user with all the pending questions from this.questions
   *
   * @private
   * @return {Promise} Will resolve when response is emitted
   */
  async _prompt() {
    this.answers = await prompt(this.questions);

    for (const id of Reflect.ownKeys(this.answers)) {
      const value = this.questionMap.get(id);

      // Emit the question id the value the answer is assigned to and the
      // answer itself
      this.pipe.prompt.emit('response', id, value, this.answers[id]);
      this.questionMap.set(id, undefined);
    }

    this.questions = [];
  }

  /**
   * Take a question, when answered will assign the `value` on the returned
   * answers object or will be set as the `defaultValue`.
   *
   * @private
   * @param  {String} value          Value to assign answer to
   * @param  {String} question       Question to ask
   * @param  {String || Boolean} defaultValue  Default assignment
   * @param  {String} [type='input'] Optional type of question
   *                                 'input', 'confirm', 'list'
   * @param  {Array}  [choices=[]]   If type is list, choices in the list
   * @return {Object}                Formatted question object
   */
  // eslint-disable-next-line max-params
  _formatQuestion(value, question, defaultValue, type='input', choices=[]) {
    return {
      name: value,
      message: question,
      default: defaultValue,
      type,
      choices
    };
  }

  /**
   * Add a question to the pending questions list.
   *
   * @private
   * @param {String} id           Unique question id
   * @param {String} value        Value to assign answer to
   * @param {String} question     Question to ask
   * @param {String} type         Optional type of question
   *                              'input', 'confirm', 'list'
   * @param {String || Boolean} defaultValue Default assignment
   * @param {Array} choices      If type is list, choices in the list
   */
  // eslint-disable-next-line max-params
  _addQuestion(id, value, question, type, defaultValue, choices) {
    this.questionMap.set(id, value);
    this.questions.push(
      this._formatQuestion(id, question, defaultValue, type, choices)
    );
  }

  /**
   * Initialise the plugin with a config and pipe.
   *
   * @param  {Object}  config    Config object containing plugins and data
   * @param  {Object}  [pipe={}] Shared events pipe object
   * @return {Promise}           Plugin initialised when resolved
   */
  async init(config, pipe={}) {
    this.config = config;
    this.printer = config.printer;
    this.pipe = pipe;

    if (!this.pipe.prompt) {
      this.pipe.prompt = new EventEmitter();
    }

    this.pipe.prompt.on('question', this._addQuestion.bind(this));
    this.pipe.prompt.on('ask', this._prompt.bind(this));

    // Initialisation complete
    this.emit('initialised');
  }

  getPipe() {
    return this.pipe;
  }

  setPipe(pipe) {
    this.pipe = pipe;
  }
}

export default ApplifyPromptPlugin;
