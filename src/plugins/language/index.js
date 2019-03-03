import {STEP_COMPLETE} from '../../events';
import {
  getBabelDetails,
  getReduxDetails,
  getRouterDetails,
  getLinterDetails
} from './details';
import {
  installCoreLanguageDeps,
  createBabelConfig,
  createEslintConfig
} from './functionality';


export const init = async (store)=> {
  await getBabelDetails(store);
  await getReduxDetails(store);
  await getRouterDetails(store);
  await getLinterDetails(store);

  store.emit(STEP_COMPLETE, 'init:language');
  store.completedSteps.push('init:language');

  return Promise.resolve(null);
};

export const run = async (store)=> {
  await installCoreLanguageDeps(store);
  await createBabelConfig(store);

  if (store.answers.useEslint) {
    await createEslintConfig(store);
  }

  // TODO Create redux store, reducer files
  // TODO Create router files

  store.emit(STEP_COMPLETE, 'run:language');
  store.completedSteps.push('run:language');

  return ()=> Promise.resolve(null);
};
