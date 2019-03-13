import ApplifyPlugin from '..';
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
import {getLocalGitProfile} from './helpers';
import {property} from '../../utils/obj';
import * as questions from './questions';


/*
  ApplifySourcePlugin will setup git remote and commitizen, push local
  changes to the remote, and lock down the master branch
 */
export default class ApplifySourcePlugin extends ApplifyPlugin {
  static async build(opts={}) {
    const owner = await getLocalGitProfile();

    return new ApplifySourcePlugin(opts, {owner});
  }

  constructor(opts, defaults) {
    super('source');

    this.scope = [
      {
        detail: 'useGit',
        value: property(opts, 'git'),
        default: property(defaults, 'git')
      },
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

  async init(store) {
    for (const {detail, default: defaultAnswer} of this.scope) {
      if (questions[detail]) {
        await questions[detail](store, defaultAnswer);
      }
    }

    store.emit(STEP_COMPLETE, 'init:source');
    store.completedSteps.push('init:source');

    return ()=> new Promise((resolve)=> {
      if (store.answers.useGit) {
        store.on(INIT_COMPLETE, async ()=> {
          // await initialiseGit(store);
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

    store.emit(STEP_COMPLETE, 'run:source');
    store.completedSteps.push('run:source');

    return ()=> Promise.resolve(null);
  }

  async finish(store) {
    if (store.answers.useGit) {
      // await checkoutAndPush(store);

      if (store.answers.lockMasterBranch) {
        await lockDownMasterBranch(store);
      }
    }

    store.emit(STEP_COMPLETE, 'finish:source');
    store.completedSteps.push('finish:source');

    return ()=> Promise.resolve(null);
  }
}
