import ApplifyPlugin from '..';
import {STEP_COMPLETE, FINISH_COMPLETE} from '../../events';
import {
  createCIConfig,
  hookupCI,
  activateTravisApp
} from './functionality';


/*
  ApplifyIntegrationPlugin will set up the ci pipeline
 */
export default class ApplifyTravisIntegrationPlugin extends ApplifyPlugin {
  static async build(opts={}) {
    return new ApplifyTravisIntegrationPlugin(opts);
  }

  constructor() {
    super('travis');

    this.scope = [];
  }

  async patch(store) {
    for (const {detail, value} of this.scope) {
      const preDefined = store[detail];
      store.answers[detail] = preDefined === undefined ? value : preDefined;
    }

    // Automatically true because the plugin was imported
    store.answers.useCi = true;
    store.answers.ciPlatform = 'travis-ci';

    store.emit(STEP_COMPLETE, 'patch:travis');
    store.completedSteps.push('patch:travis');

    return ()=> Promise.resolve(null);
  }

  async run(store) {
    if (store.answers.ciPlatform === 'travis-ci') {
      await createCIConfig(store);
    }

    store.emit(STEP_COMPLETE, 'run:travis');
    store.completedSteps.push('run:travis');

    return ()=> Promise.resolve(null);
  }

  async finish(store) {
    if (store.answers.ciPlatform === 'travis-ci') {
      await hookupCI(store);
    }

    store.emit(STEP_COMPLETE, 'finish:travis');
    store.completedSteps.push('finish:travis');

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
