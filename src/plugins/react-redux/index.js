import ApplifyPlugin from '..';
import {STEP_COMPLETE} from '../../events';
import {installReactReduxDependencies} from './functionality';
import {property} from '../../utils/obj';
import * as questions from './questions';


/*
  ApplifyReactReduxPlugin will install core framework dependencies based
  on options (e.g. redux, router, connected router)
 */
export default class ApplifyReactReduxPlugin extends ApplifyPlugin {
  static async build(opts={}) {
    return new ApplifyReactReduxPlugin(opts);
  }

  constructor(opts, defaults) {
    super('react-redux', questions);

    this.scope = [
      {
        detail: 'useRouter',
        value: property(opts, 'router'),
        default: property(defaults, 'router')
      }
    ];
  }

  async patch(store) {
    for (const {detail, value} of this.scope) {
      const preDefined = store[detail];
      store.answers[detail] = preDefined === undefined ? value : preDefined;
    }

    // Automatically true because the plugin was imported
    store.answers.useRedux = true;

    store.emit(STEP_COMPLETE, 'patch:react-redux');
    store.completedSteps.push('patch:react-redux');

    return ()=> Promise.resolve(null);
  }

  async run(store) {
    await installReactReduxDependencies(store);

    store.emit(STEP_COMPLETE, 'run:react-redux');
    store.completedSteps.push('run:react-redux');

    return ()=> Promise.resolve(null);
  }
}
