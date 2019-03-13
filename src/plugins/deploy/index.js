import ApplifyPlugin from '..';
import {STEP_COMPLETE, FINISH_COMPLETE} from '../../events';
import {
  createCIConfig,
  hookupCI,
  activateTravisApp
} from './functionality';
import {property} from '../../utils/obj';
import * as questions from './questions';


/*
  ApplifyIntegrationPlugin will set up the ci pipeline
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

  async patch(store) {
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
    if (store.answers.ciPlatform === 'travis-ci') {
      await createCIConfig(store);
    }

    store.emit(STEP_COMPLETE, 'run:deploy');
    store.completedSteps.push('run:deploy');

    return ()=> Promise.resolve(null);
  }

  async finish(store) {
    if (store.answers.ciPlatform === 'travis-ci') {
      await hookupCI(store);
    }

    store.emit(STEP_COMPLETE, 'finish:deploy');
    store.completedSteps.push('finish:deploy');

    return ()=> new Promise((resolve)=> {
      if (store.answers.ciPlatform === 'travis-ci') {
        store.on(FINISH_COMPLETE, async ()=> {
          await activateTravisApp(store);
          resolve(null);
        });
      }
    });
  }
}
