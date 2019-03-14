import ApplifyPlugin from '..';
import {STEP_COMPLETE} from '../../events';
import {
  installStorybook,
  copyStorybookTemplateFiles,
  writeStorybookWebpackConfig,
  writeStorybookHelpers
} from './functionality';
import {property} from '../../utils/obj';
import * as questions from './questions';


/*
  ApplifyStorybookPlugin will setup storybook ui
 */
export default class ApplifyStorybookPlugin extends ApplifyPlugin {
  static async build(opts={}) {
    return new ApplifyStorybookPlugin(opts);
  }

  constructor(opts, defaults) {
    super('storybook', questions);

    this.scope = [
      {
        detail: 'storybookServerPort',
        value: property(opts, 'port'),
        default: property(defaults, 'port')
      }
    ];
  }

  async patch(store) {
    for (const {detail, value} of this.scope) {
      const preDefined = store[detail];
      store.answers[detail] = preDefined === undefined ? value : preDefined;
    }

    // Automatically true because the plugin was imported
    store.answers.useStorybook = true;

    store.emit(STEP_COMPLETE, 'patch:storybook');
    store.completedSteps.push('patch:storybook');

    return ()=> Promise.resolve(null);
  }

  async run(store) {
    if (store.answers.useStorybook) {
      await installStorybook(store);
      await copyStorybookTemplateFiles(store);
      await writeStorybookWebpackConfig(store);
      await writeStorybookHelpers(store);
    }

    store.emit(STEP_COMPLETE, 'run:storybook');
    store.completedSteps.push('run:storybook');

    return ()=> Promise.resolve(null);
  }
}
