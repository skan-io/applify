import {STEP_COMPLETE} from '../../events';
import {createReadme, createSrcDirectory} from './functionality';
import {getNpmProfileName} from './helpers';
import {property} from '../../utils/obj';
import * as questions from './questions';


/*
  ApplifyMetaPlugin will collect some project meta data and create the
  project's README.md
 */
export default class ApplifyProjectPlugin {
  // Build function allows async activity pre construction
  static async build(buildFn=()=> ({})) {
    const author = await getNpmProfileName();
    // Return the actual instance
    return new ApplifyProjectPlugin(await buildFn(), {author});
  }

  // Constructor defines the variables that the plugin will control via scope
  constructor(opts, defaults) {
    this.scope = [
      {
        detail: 'projectName',
        value: property(opts, 'name'),
        default: property(defaults, 'name')
      },
      {
        detail: 'projectDescription',
        value: property(opts, 'description'),
        default: property(defaults, 'description')
      },
      {
        detail: 'projectAuthor',
        value: property(opts, 'author'),
        default: property(defaults, 'author')
      },
      {
        detail: 'projectPrivate',
        value: property(opts, 'private'),
        default: property(defaults, 'private')
      },
      {
        detail: 'projectLicense',
        value: property(opts, 'license'),
        default: property(defaults, 'license')
      }
    ];
  }

  // Patch the store with scoped details
  patch(store) {
    for (const {detail, value} of this.scope) {
      // If the value was already defined in the store (preloaded)
      const preDefined = store[detail];
      store.answers[detail] = preDefined === undefined ? value : preDefined;
    }

    store.emit(STEP_COMPLETE, 'patch:project');
    store.completedSteps.push('patch:project');

    return ()=> Promise.resolve(null);
  }

  // Check is run prior to init, normally to check the environment
  async check(store) {
    store.emit(STEP_COMPLETE, 'check:project');
    store.completedSteps.push('check:project');

    // Returning a promise allows stages to respond to
    // events
    return ()=> Promise.resolve(null);
  }

  // Init function runs all the unanswered, required questions
  async init(store) {
    for (const {detail, default: defaultAnswer} of this.scope) {
      if (questions[detail]) {
        await questions[detail](store, defaultAnswer);
      }
    }

    store.emit(STEP_COMPLETE, 'init:project');
    store.completedSteps.push('init:project');

    return ()=> Promise.resolve(null);
  }

  // Run function completes the purpose of the plugin
  async run(store) {
    await createReadme(store);
    await createSrcDirectory(store);

    store.emit(STEP_COMPLETE, 'run:project');
    store.completedSteps.push('run:project');

    return ()=> Promise.resolve(null);
  }

  // Finish function is run after everything is complete, normally for cleanup
  async finish(store) {
    store.emit(STEP_COMPLETE, 'finish:project');
    store.completedSteps.push('finish:project');

    return ()=> Promise.resolve(null);
  }
}
