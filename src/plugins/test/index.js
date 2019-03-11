import {STEP_COMPLETE} from '../../events';
import {
  getShouldTest,
  getShouldCoverageAndEnzyme,
  getCoverageDetails
} from './details';
import {
  installTestingDependecies,
  createJestConfig,
  createTestingSetupFiles
} from './functionality';


export const init = async (store)=> {
  await getShouldTest(store);

  if (store.answers.useJest) {
    await getShouldCoverageAndEnzyme(store);

    if (store.answers.useCodeCoverage) {
      await getCoverageDetails(store);
    }
  }

  store.emit(STEP_COMPLETE, 'init:test');
  store.completedSteps.push('init:test');

  return ()=> Promise.resolve(null);
};


export const run = async (store)=> {
  if (store.answers.useJest) {
    await installTestingDependecies(store);
    await createJestConfig(store);
    await createTestingSetupFiles(store);
  }

  store.emit(STEP_COMPLETE, 'run:test');
  store.completedSteps.push('run:test');

  return ()=> Promise.resolve(null);
};
