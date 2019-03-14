import ApplifyPlugin from '..';
import {STEP_COMPLETE} from '../../events';
import {installEslintDependencies, createEslintConfig} from './functionality';


/*
  ApplifyEslintPlugin will setup eslint and eslint config
 */
export default class ApplifyEslintPlugin extends ApplifyPlugin {
  static async build(opts={}) {
    return new ApplifyEslintPlugin(opts);
  }

  constructor() {
    super('eslint');

    this.scope = [];
  }

  async patch(store) {
    for (const {detail, value} of this.scope) {
      const preDefined = store[detail];
      store.answers[detail] = preDefined === undefined ? value : preDefined;
    }

    // Automatically true because the plugin was imported
    store.answers.useEslint = true;

    store.emit(STEP_COMPLETE, 'patch:eslint');
    store.completedSteps.push('patch:eslint');

    return ()=> Promise.resolve(null);
  }

  async run(store) {
    await installEslintDependencies(store);
    await createEslintConfig(store);

    store.emit(STEP_COMPLETE, 'run:eslint');
    store.completedSteps.push('run:eslint');

    return ()=> Promise.resolve(null);
  }
}
