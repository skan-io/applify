import ApplifyPlugin from '..';
import {STEP_COMPLETE} from '../../events';
import {installRemarkDependencies} from './functionality';


/*
  ApplifyRemarkLintPlugin will setup remark markdown linting
 */
export default class ApplifyRemarkLintPlugin extends ApplifyPlugin {
  static async build(opts={}) {
    return new ApplifyRemarkLintPlugin(opts);
  }

  constructor() {
    super('remark');

    this.scope = [];
  }

  async patch(store) {
    for (const {detail, value} of this.scope) {
      const preDefined = store[detail];
      store.answers[detail] = preDefined === undefined ? value : preDefined;
    }

    // Automatically true because the plugin was imported
    store.answers.useRemarkLint = true;

    store.emit(STEP_COMPLETE, 'patch:remark');
    store.completedSteps.push('patch:remark');

    return ()=> Promise.resolve(null);
  }

  async run(store) {
    await installRemarkDependencies(store);

    store.emit(STEP_COMPLETE, 'run:remark');
    store.completedSteps.push('run:remark');

    return ()=> Promise.resolve(null);
  }
}
