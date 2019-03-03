import {STEP_COMPLETE, INIT_COMPLETE} from '../../events';
import {
  attachPackageInstaller,
  initialisePackageJson,
  installSupportTools,
  createPackageScripts
} from './functionality';


export const init = async (store)=> {
  store.emit(STEP_COMPLETE, 'init:package');
  store.completedSteps.push('init:package');

  return ()=> new Promise((resolve)=> {
    store.on(INIT_COMPLETE, async ()=> {
      await attachPackageInstaller(store);
      resolve(null);
    });
  });
};

export const run = async (store)=> {
  if (!store.completedSteps.some((step)=> step === 'run:package')) {
    await initialisePackageJson(store);
    await installSupportTools(store);
    await createPackageScripts(store);
  }

  store.emit(STEP_COMPLETE, 'run:package');
  store.completedSteps.push('run:package');

  return ()=> Promise.resolve(null);
};
