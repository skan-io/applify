import {STEP_COMPLETE} from '../../events';
import {getStyleDetails, getStorybookDetails} from './details';
import {installStorybook} from './functionality';


export const init = async (store)=> {
  await getStyleDetails(store);
  
  if (store.answers.useStorybook) {
    await getStorybookDetails(store);
  }

  store.emit(STEP_COMPLETE, 'init:style');
  store.completedSteps.push('init:style');

  return ()=> Promise.resolve(null);
};

export const run = async (store)=> {
  if (store.answers.useStorybook) {
    await installStorybook(store);
  }

  store.emit(STEP_COMPLETE, 'run:style');
  store.completedSteps.push('run:style');

  return ()=> Promise.resolve(null);
};
