import {STEP_COMPLETE} from '../../events';
import {getBuildDetails} from './details';
import {installWebpack, createWebpackConfig} from './functionality';


export const init = async (store)=> {
  await getBuildDetails(store);

  store.emit(STEP_COMPLETE, 'init:build');
  store.completedSteps.push('init:build');

  return ()=> Promise.resolve(null);
};

export const run = async (store)=> {
  await installWebpack(store);
  await createWebpackConfig(store);

  store.emit(STEP_COMPLETE, 'run:build');
  store.completedSteps.push('run:build');

  return ()=> Promise.resolve(null);
};
