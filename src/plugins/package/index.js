import {STEP_COMPLETE, INIT_COMPLETE} from '../../events';
import {checkEnvironment} from './checks';
import {
  attachPackageInstaller,
  initialisePackageJson,
  installSupportTools,
  createPackageScripts
} from './functionality';
import {property} from '../../utils/obj';


export default class ApplifyPackagePlugin {
  // Build function allows async activity pre construction
  static async build(buildFn=()=> ({})) {
    // Return the actual instance
    return new ApplifyPackagePlugin(await buildFn());
  }

  // Constructor defines the variables that the plugin will control via scope
  constructor(opts) {
    this.scope = [
      {detail: 'packageManager', value: property(opts, 'manager')},
      {detail: 'packageManagerVersion', value: property(opts, 'version')}
    ];
  }

  // Patch the store with scoped details
  patch(store) {
    for (const {detail, value} of this.scope) {
      const preDefined = store[detail];
      store.answers[detail] = preDefined === undefined ? value : preDefined;
    }

    store.emit(STEP_COMPLETE, 'patch:project');
    store.completedSteps.push('patch:project');

    return ()=> Promise.resolve(null);
  }

  // Check is run prior to init, normally to check the environment
  async check(store) {
    await checkEnvironment(store);

    store.emit(STEP_COMPLETE, 'check:project');
    store.completedSteps.push('check:project');

    // Returning a promise allows stages to respond to
    // events
    return ()=> Promise.resolve(null);
  }

  // Init function runs all the unanswered, required questions
  async init(store) {
    store.emit(STEP_COMPLETE, 'init:package');
    store.completedSteps.push('init:package');

    return ()=> new Promise((resolve)=> {
      store.on(INIT_COMPLETE, async ()=> {
        await attachPackageInstaller(store);
        resolve(null);
      });
    });
  }

  // Run function completes the purpose of the plugin
  async run(store) {
    await initialisePackageJson(store);
    await installSupportTools(store);
    await createPackageScripts(store);

    store.emit(STEP_COMPLETE, 'run:package');
    store.completedSteps.push('run:package');

    return ()=> Promise.resolve(null);
  }

  // Finish function is run after everything is complete, normally for cleanup
  async finish(store) {
    store.emit(STEP_COMPLETE, 'finish:project');
    store.completedSteps.push('finish:project');

    return ()=> Promise.resolve(null);
  }
}
