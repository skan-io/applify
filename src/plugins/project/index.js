import {STEP_COMPLETE} from '../../events';
import {checkEnvironment} from './checks';
import {getEnvironmentDetails, getProjectDetails} from './details';
import {createReadme, createSrcDirectory} from './functionality';


export const init = async (store)=> {
  await getEnvironmentDetails(store);
  await checkEnvironment(store);
  await getProjectDetails(store);

  store.emit(STEP_COMPLETE, 'init:project');
  store.completedSteps.push('init:project');

  return ()=> Promise.resolve(null);
};

export const run = async (store)=> {
  await createReadme(store);
  await createSrcDirectory(store);

  store.emit(STEP_COMPLETE, 'run:project');
  store.completedSteps.push('run:project');

  return ()=> Promise.resolve(null);
};
