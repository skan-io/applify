import ApplifyPlugin from '..';
import {STEP_COMPLETE} from '../../events';
import {installWebpack, createWebpackConfig} from './functionality';
import {property} from '../../utils/obj';
import * as questions from './questions';


/*
  ApplifyBundlePlugin will configure webpack and the webpack dev server
 */
export default class ApplifyBundlePlugin extends ApplifyPlugin {
  static async build(opts={}) {
    return new ApplifyBundlePlugin(opts);
  }

  constructor(opts, defaults) {
    super('bundle', questions);

    this.scope = [
      {
        detail: 'buildEntries',
        value: property(opts, 'entries'),
        default: property(defaults, 'entries')
      },
      {
        detail: 'buildOutputPath',
        value: property(opts, 'output'),
        default: property(defaults, 'output')
      },
      {
        detail: 'devServerPort',
        value: property(opts, 'port'),
        default: property(defaults, 'port')
      }
    ];
  }
  
  async run(store) {
    await installWebpack(store);
    await createWebpackConfig(store);

    store.emit(STEP_COMPLETE, 'run:bundle');
    store.completedSteps.push('run:bundle');

    return ()=> Promise.resolve(null);
  }
}
