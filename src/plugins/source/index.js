import {
  STEP_COMPLETE,
  INIT_COMPLETE,
  RUN_COMPLETE
} from '../../events';
import {
  initialiseGit,
  rewriteGitIgnore,
  setupCommitizen,
  checkoutAndPush,
  lockDownMasterBranch
} from './functionality';
import * as questions from './questions';
import {property} from '../../utils/obj';


/*
  ApplifySourcePlugin will setup git remote and commitizen and will push local
  changes to the remote, and lock down the master branch
 */
export default class ApplifySourcePlugin {
  // Build function allows async activity pre construction
  static async build(buildFn=()=> ({})) {
    // Return the actual instance
    return new ApplifySourcePlugin(await buildFn());
  }

  // Constructor defines the variables that the plugin will control via scope
  constructor(opts) {
    this.scope = [
      {detail: 'useGit', value: property(opts, 'git')},
      {detail: 'repoOwner', value: property(opts, 'owner')},
      {detail: 'repoOrg', value: property(opts, 'organisation')},
      {detail: 'gitAccessToken', value: property(opts, 'accessToken')},
      {detail: 'repoMaintainers', value: property(opts, 'maintainers')},
      {detail: 'initialBranches', value: property(opts, 'branches')},
      {detail: 'lockMasterBranch', value: property(opts, 'lockMaster')},
      {detail: 'useCommitizen', value: property(opts, 'commitizen')}
    ];
  }

  // Patch the store with scoped details
  patch(store) {
    for (const {detail, value} of this.scope) {
      const preDefined = store[detail];
      store.answers[detail] = preDefined === undefined ? value : preDefined;
    }

    store.emit(STEP_COMPLETE, 'patch:source');
    store.completedSteps.push('patch:source');

    return ()=> Promise.resolve(null);
  }

  // Check is run prior to init, normally to check the environment
  async check(store) {
    store.emit(STEP_COMPLETE, 'check:source');
    store.completedSteps.push('check:source');

    // Returning a promise allows stages to respond to
    // events
    return ()=> Promise.resolve(null);
  }

  // Init function runs all the unanswered, required questions
  async init(store) {
    for (const {detail, value} of this.scope) {
      if (value === undefined) {
        if (questions[detail]) {
          await questions[detail](store);
        }
      }
    }

    store.emit(STEP_COMPLETE, 'init:source');
    store.completedSteps.push('init:source');

    return ()=> new Promise((resolve)=> {
      if (store.answers.useGit) {
        store.on(INIT_COMPLETE, async ()=> {
          await initialiseGit(store);
          await rewriteGitIgnore(store);
          resolve(null);
        });
      }
    });
  }

  // Run function completes the purpose of the plugin
  async run(store) {
    if (store.answers.useGit) {
      if (store.answers.useCommitizen) {
        await setupCommitizen(store);
      }
    }

    store.emit(STEP_COMPLETE, 'run:source');
    store.completedSteps.push('run:source');

    return ()=> Promise.resolve(null);
  }

  // Finish function is run after everything is complete, normally for cleanup
  async finish(store) {
    if (store.answers.useGit) {
      await checkoutAndPush(store);

      if (store.answers.lockMasterBranch) {
        await lockDownMasterBranch(store);
      }
    }

    store.emit(STEP_COMPLETE, 'finish:source');
    store.completedSteps.push('finish:source');

    return ()=> Promise.resolve(null);
  }
}
