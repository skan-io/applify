import ApplifyPlugin from '..';
import {STEP_COMPLETE, INIT_COMPLETE} from '../../events';
import {checkEnvironment} from './checks';
import {
  attachPackageInstaller,
  initialisePackageJson,
  installSupportTools,
  createPackageScripts
} from './functionality';
import {property} from '../../utils/obj';


/*
  ApplifyPackagePlugin will check the node, npm and yarn versions,
  create the package.json and will create the package run script
 */
export default class ApplifyPackagePlugin extends ApplifyPlugin {
  static async build(opts={}) {
    return new ApplifyPackagePlugin(opts);
  }

  constructor(opts) {
    super('package');

    this.scope = [
      {detail: 'packageManager', value: property(opts, 'manager') || 'npm'},
      {detail: 'packageManagerVersion', value: property(opts, 'version')}
    ];
  }

  async check(store) {
    await checkEnvironment(store);

    store.emit(STEP_COMPLETE, 'check:package');
    store.completedSteps.push('check:package');

    return ()=> Promise.resolve(null);
  }

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

  async run(store) {
    await initialisePackageJson(store);
    await installSupportTools(store);
    await createPackageScripts(store);

    store.emit(STEP_COMPLETE, 'run:package');
    store.completedSteps.push('run:package');

    return ()=> Promise.resolve(null);
  }
}
