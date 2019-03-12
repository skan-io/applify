import ApplifyPlugin from '..';
import {STEP_COMPLETE} from '../../events';
import {
  installFrameworkDependencies,
  createEslintConfig
} from './functionality';
import {property} from '../../utils/obj';
import * as questions from './questions';


/*
  ApplifyFrameworkPlugin will install core language dependencies based
  on options (e.g. redux, router, connected router, eslint)
 */
export default class ApplifyFrameworkPlugin extends ApplifyPlugin {
  static async build(opts={}) {
    return new ApplifyFrameworkPlugin(opts);
  }

  constructor(opts, defaults) {
    super('framework', questions);

    this.scope = [
      {
        detail: 'useRedux',
        value: property(opts, 'redux'),
        default: property(defaults, 'redux')
      },
      {
        detail: 'useRouter',
        value: property(opts, 'router'),
        default: property(defaults, 'router')
      },
      {
        detail: 'useEslint',
        value: property(opts, 'eslint'),
        default: property(defaults, 'eslint')
      }
    ];
  }

  // Run function completes the purpose of the plugin
  async run(store) {
    await installFrameworkDependencies(store);

    if (store.answers.useEslint) {
      await createEslintConfig(store);
    }

    store.emit(STEP_COMPLETE, 'run:framework');
    store.completedSteps.push('run:framework');

    return ()=> Promise.resolve(null);
  }
}
