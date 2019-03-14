import ApplifyPlugin from '..';
import {STEP_COMPLETE} from '../../events';
import {
  installJestEnzymeDependecies,
  createJestConfig,
  createTestingSetupFiles
} from './functionality';
import {property} from '../../utils/obj';
import * as questions from './questions';


/*
  ApplifyJestEnzymePlugin will setup jest, code coverage and enzyme
 */
export default class ApplifyJestEnzymePlugin extends ApplifyPlugin {
  static async build(opts={}) {
    return new ApplifyJestEnzymePlugin(opts);
  }

  constructor(opts, defaults) {
    super('jest-enzyme', questions);

    this.scope = [
      {
        detail: 'useCodeCoverage',
        value: property(opts, 'coverage'),
        default: property(defaults, 'coverage')
      },
      {
        detail: 'statementsPercentageCoverage',
        value: property(opts, 'statements'),
        default: property(defaults, 'statements')
      },
      {
        detail: 'functionsPercentageCoverage',
        value: property(opts, 'functions'),
        default: property(defaults, 'functions')
      },
      {
        detail: 'branchesPercentageCoverage',
        value: property(opts, 'branches'),
        default: property(defaults, 'branches')
      },
      {
        detail: 'linesPercentageCoverage',
        value: property(opts, 'lines'),
        default: property(defaults, 'lines')
      }
    ];
  }

  async patch(store) {
    for (const {detail, value} of this.scope) {
      const preDefined = store[detail];
      store.answers[detail] = preDefined === undefined ? value : preDefined;
    }

    // Automatically true because the plugin was imported
    store.answers.useJest = true;
    store.answers.useEnzyme = true;

    store.emit(STEP_COMPLETE, 'patch:jest-enzyme');
    store.completedSteps.push('patch:jest-enzyme');

    return ()=> Promise.resolve(null);
  }

  async run(store) {
    await installJestEnzymeDependecies(store);
    await createJestConfig(store);
    await createTestingSetupFiles(store);

    store.emit(STEP_COMPLETE, 'run:jest-enzyme');
    store.completedSteps.push('run:jest-enzyme');

    return ()=> Promise.resolve(null);
  }
}
