import ApplifyPlugin from '..';
import {STEP_COMPLETE} from '../../events';
import {property} from '../../utils/obj';
import {createBabelConfig, installBabelDependencies} from './functionality';
import * as questions from './questions';


/*
  ApplifyMetaPlugin will collect some project meta data and create the
  project's README.md
 */
export default class ApplifyBabelPlugin extends ApplifyPlugin {
  static async build(opts={}) {
    return new ApplifyBabelPlugin(opts);
  }

  constructor(opts, defaults) {
    super('babel', questions);

    this.scope = [
      {
        detail: 'nodeTarget',
        value: property(opts, 'nodeTarget'),
        default: property(defaults, 'nodeTarget')
      },
      {
        detail: 'browserTargets',
        value: property(opts, 'browserTargets'),
        default: property(defaults, 'browserTargets')
      },
      {
        detail: 'babelPlugins',
        value: property(opts, 'plugins'),
        default: property(defaults, 'plugins')
      }
    ];
  }

  async run(store) {
    await installBabelDependencies(store);
    await createBabelConfig(store);

    store.emit(STEP_COMPLETE, 'run:babel');
    store.completedSteps.push('run:babel');

    return ()=> Promise.resolve(null);
  }
}
