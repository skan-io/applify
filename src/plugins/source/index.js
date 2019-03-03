import {STEP_COMPLETE, RUN_COMPLETE} from '../../events';
import {getShouldUseGit, getRepoDetails, getGitAccessToken} from './details';
import {
  initialiseGit,
  rewriteGitIgnore,
  setupCommitizen,
  checkoutAndPush,
  lockDownMasterBranch
} from './functionality';


export const init = async (store, config)=> {
  await getShouldUseGit(store);

  if (store.answers.useGit) {
    await getRepoDetails(store, config);
    await getGitAccessToken(store, config);
  }

  store.emit(STEP_COMPLETE, 'init:source');
  store.completedSteps.push('init:source');

  return ()=> Promise.resolve(null);
};

export const run = async (store)=> {
  if (store.answers.useGit) {
    await initialiseGit(store);
    await rewriteGitIgnore(store);

    if (store.answers.useCommitizen) {
      await setupCommitizen(store);
    }
  }

  return ()=> new Promise((resolve)=> {
    store.on(RUN_COMPLETE, async ()=> {
      if (store.answers.useGit) {
        await checkoutAndPush(store);

        if (store.answers.lockMasterBranch) {
          await lockDownMasterBranch(store);
        }
      }

      store.emit(STEP_COMPLETE, 'run:source');
      store.completedSteps.push('run:source');

      resolve(null);
    });
  });
};
