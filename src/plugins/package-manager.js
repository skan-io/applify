import {STEP_COMPLETE} from '../events';


export const init = async (store, config)=> {
  if (store.completedSteps.some((step)=> step === 'init:package')) {

  } else {
    store.emit(STEP_COMPLETE, 'init:package');
    store.completedSteps.push('init:pacakge');
  }
};
