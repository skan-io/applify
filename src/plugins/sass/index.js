import ApplifyPlugin from '..';
import {STEP_COMPLETE} from '../../events';
import {installSassDependencies, createSassLintConfig} from './functionality';
import {property} from '../../utils/obj';
import * as questions from './questions';


/*
  ApplifySassPlugin will setup sass loaders and the sass ui kit of choice
  // TODO update skan-io/webpack to depend on node-sass
 */
export default class ApplifySassPlugin extends ApplifyPlugin {
  static async build(opts={}) {
    return new ApplifySassPlugin(opts);
  }

  constructor(opts, defaults) {
    super('sass', questions);

    this.scope = [
      {
        detail: 'uiChoice',
        value: property(opts, 'kit'),
        default: property(defaults, 'kit')
      }
    ];
  }

  async patch(store) {
    for (const {detail, value} of this.scope) {
      const preDefined = store[detail];
      store.answers[detail] = preDefined === undefined ? value : preDefined;
    }

    // Automatically true because the plugin was imported
    store.answers.styleChoice = 'sass';

    store.emit(STEP_COMPLETE, 'patch:sass');
    store.completedSteps.push('patch:sass');

    return ()=> Promise.resolve(null);
  }

  async run(store) {
    await installSassDependencies(store);
    await createSassLintConfig(store);

    store.emit(STEP_COMPLETE, 'run:sass');
    store.completedSteps.push('run:sass');

    return ()=> Promise.resolve(null);
  }
}
