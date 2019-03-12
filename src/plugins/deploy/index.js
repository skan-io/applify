import ApplifyPlugin from '..';
import {STEP_COMPLETE} from '../../events';
import {
  createCIConfig,
  hookupCI,
  activateTravisApp
} from './functionality';
import {property} from '../../utils/obj';
import * as questions from './questions';


/*
  ApplifyDeployPlugin will set up the ci pipeline and deployment environment
  TODO: break ci into ApplifyIntegrationPlugin
 */
export default class ApplifyDeployPlugin extends ApplifyPlugin {
  static async build(opts={}) {
    return new ApplifyDeployPlugin(opts);
  }

  constructor(opts, defaults) {
    super('deploy', questions);

    this.scope = [
      {
        detail: 'ciPlatform',
        value: property(opts, 'platform'),
        default: property(defaults, 'platform')
      },
      {
        detail: 'deployEnv',
        value: property(opts, 'deployEnv'),
        default: property(defaults, 'deployEnv')
      },
      {
        detail: 'deployPath',
        value: property(opts, 'deployPath'),
        default: property(defaults, 'deployPath')
      }
    ];
  }

  patch(store) {
    for (const {detail, value} of this.scope) {
      const preDefined = store[detail];
      store.answers[detail] = preDefined === undefined ? value : preDefined;
    }

    // Automatically true because the plugin was imported
    store.answers.useCi = true;

    store.emit(STEP_COMPLETE, 'patch:deploy');
    store.completedSteps.push('patch:deploy');

    return ()=> Promise.resolve(null);
  }

  async run(store) {
    if (store.answers.useCi && store.answers.useGit) {
      await createCIConfig(store);
    }

    store.emit(STEP_COMPLETE, 'run:deploy');
    store.completedSteps.push('run:deploy');

    return ()=> Promise.resolve(null);
  }

  async finish(store) {
    if (store.answers.ciPlatform === 'travis-ci') {
      await activateTravisApp(store);
      await hookupCI(store);
    }

    store.emit(STEP_COMPLETE, 'finish:deploy');
    store.completedSteps.push('finish:deploy');

    return ()=> Promise.resolve(null);
  }
}
