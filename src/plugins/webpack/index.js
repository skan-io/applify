import ApplifyPlugin from '..';
import {STEP_COMPLETE} from '../../events';
import {installWebpack, createWebpackConfig} from './functionality';
import {property} from '../../utils/obj';
import * as questions from './questions';


/*
  ApplifyWebpackPlugin will configure webpack and the webpack dev server
 */
export default class ApplifyWebpackPlugin extends ApplifyPlugin {
  static async build(opts={}) {
    return new ApplifyWebpackPlugin(opts);
  }

  constructor(opts, defaults) {
    super('webpack', questions);

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

    store.emit(STEP_COMPLETE, 'run:webpack');
    store.completedSteps.push('run:webpack');

    return ()=> Promise.resolve(null);
  }
}
