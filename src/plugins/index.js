import {STEP_COMPLETE} from '../events';


export default class ApplifyPlugin {
  constructor(name, questions) {
    this.name = name;
    this.questions = questions;
  }

  // Patch the store with scoped details
  patch(store) {
    for (const {detail, value} of this.scope) {
      // If the value was already defined in the store (preloaded)
      const preDefined = store[detail];
      store.answers[detail] = preDefined === undefined ? value : preDefined;
    }

    store.emit(STEP_COMPLETE, `patch:${this.name}`);
    store.completedSteps.push(`patch:${this.name}`);

    return ()=> Promise.resolve(null);
  }

  // Check is run prior to init, normally to check the environment
  async check(store) {
    store.emit(STEP_COMPLETE, `check:${this.name}`);
    store.completedSteps.push(`check:${this.name}`);

    // Returning a promise allows stages to respond to
    // events
    return ()=> Promise.resolve(null);
  }

  // Init function runs all the unanswered, required questions
  async init(store) {
    for (const {detail, default: defaultAnswer} of this.scope) {
      if (this.questions[detail]) {
        await this.questions[detail](store, defaultAnswer);
      }
    }

    store.emit(STEP_COMPLETE, `init:${this.name}`);
    store.completedSteps.push(`init:${this.name}`);

    return ()=> Promise.resolve(null);
  }

  // Run function completes the purpose of the plugin
  async run(store) {
    store.emit(STEP_COMPLETE, `run:${this.name}`);
    store.completedSteps.push(`run:${this.name}`);

    return ()=> Promise.resolve(null);
  }

  // Finish function is run after everything is complete, normally for cleanup
  async finish(store) {
    store.emit(STEP_COMPLETE, `finish:${this.name}`);
    store.completedSteps.push(`finish:${this.name}`);

    return ()=> Promise.resolve(null);
  }
}
