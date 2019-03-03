import {STEP_COMPLETE} from '../../events';
import {
  getUseCi,
  getCIPlatformDetails,
  getDeployDetails
} from './details';
import {
  createCIConfig,
  hookupCI,
  activateTravisApp
} from './functionality';


export const init = async (store)=> {
  if (store.answers.useGit) {
    await getUseCi(store);

    if (store.answers.useCi) {
      await getCIPlatformDetails(store);
    }
  }

  await getDeployDetails(store);

  store.emit(STEP_COMPLETE, 'init:deploy');
  store.completedSteps.push('init:deploy');

  return ()=> Promise.resolve(null);
};

export const run = async (store)=> {
  if (store.answers.useCi && store.answers.useGit) {
    await createCIConfig(store);
    await hookupCI(store);
  }

  store.emit(STEP_COMPLETE, 'run:deploy');
  store.completedSteps.push('run:deploy');

  return ()=> new Promise((resolve)=> {
    store.on(STEP_COMPLETE, async (step)=> {
      if (step === 'run:source') {
        if (store.answers.ciPlatform === 'travis-ci') {
          await activateTravisApp();
        }
      }

      resolve(null);
    });
  });
};
