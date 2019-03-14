import ApplifyPlugin from '..';
import {
  STEP_COMPLETE,
  INIT_COMPLETE,
  RUN_COMPLETE,
  FINISH_COMPLETE
} from '../../events';
import {
  initialiseGit,
  rewriteGitIgnore,
  setupCommitizen,
  rewriteReleaseConfig,
  checkoutAndPush,
  lockDownMasterBranch
} from './functionality';
import {getLocalGitProfile} from './helpers';
import {property} from '../../utils/obj';
import * as questions from './questions';


/*
  ApplifyGithubPlugin will setup git remote and commitizen, push local
  changes to the remote, and lock down the master branch
 */
export default class ApplifyGithubPlugin extends ApplifyPlugin {
  static async build(opts={}) {
    const owner = await getLocalGitProfile();

    return new ApplifyGithubPlugin(opts, {owner});
  }

  constructor(opts, defaults) {
    super('github');

    this.scope = [
      {
        detail: 'repoOwner',
        value: property(opts, 'owner'),
        default: property(defaults, 'owner')
      },
      {
        detail: 'repoOrg',
        value: property(opts, 'organisation'),
        default: property(defaults, 'organisation')
      },
      {
        detail: 'gitAccessToken',
        value: property(opts, 'accessToken'),
        default: property(defaults, 'accessToken')
      },
      {
        detail: 'repoMaintainers',
        value: property(opts, 'maintainers'),
        default: property(defaults, 'maintainers')
      },
      {
        detail: 'initialBranches',
        value: property(opts, 'branches'),
        default: property(defaults, 'branches')
      },
      {
        detail: 'lockMasterBranch',
        value: property(opts, 'lockMaster'),
        default: property(defaults, 'lockMaster')
      },
      {
        detail: 'useCommitizen',
        value: property(opts, 'commitizen'),
        default: property(defaults, 'commitizen')
      }
    ];
  }

  async patch(store) {
    for (const {detail, value} of this.scope) {
      const preDefined = store[detail];
      store.answers[detail] = preDefined === undefined ? value : preDefined;
    }

    // Automatically true because the plugin was imported
    store.answers.useGit = true;

    store.emit(STEP_COMPLETE, 'patch:github');
    store.completedSteps.push('patch:github');

    return ()=> Promise.resolve(null);
  }

  async init(store) {
    for (const {detail, default: defaultAnswer} of this.scope) {
      if (questions[detail]) {
        await questions[detail](store, defaultAnswer);
      }
    }

    store.emit(STEP_COMPLETE, 'init:github');
    store.completedSteps.push('init:github');

    return ()=> new Promise((resolve)=> {
      if (store.answers.useGit) {
        store.on(INIT_COMPLETE, async ()=> {
          await initialiseGit(store);
          resolve(null);
        });
      }
    });
  }

  async run(store) {
    if (store.answers.useGit) {
      await rewriteGitIgnore(store);
      if (store.answers.useCommitizen) {
        await setupCommitizen(store);
      }
    }

    store.emit(STEP_COMPLETE, 'run:github');
    store.completedSteps.push('run:github');

    return ()=> new Promise((resolve)=> {
      if (store.answers.useGit) {
        if (store.answers.useCommitizen) {
          store.on(RUN_COMPLETE, async ()=> {
            await rewriteReleaseConfig(store);
            resolve(null);
          });
        }
      }
    });
  }

  async finish(store) {
    if (store.answers.useGit) {
      await checkoutAndPush(store);
    }

    store.emit(STEP_COMPLETE, 'finish:github');
    store.completedSteps.push('finish:github');

    return ()=> new Promise((resolve)=> {
      if (store.answers.useGit && store.answers.lockMasterBranch) {
        store.on(FINISH_COMPLETE, async ()=> {
          await lockDownMasterBranch(store);
          resolve(null);
        });
      }
    });
  }
}
