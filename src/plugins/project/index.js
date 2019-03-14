import ApplifyPlugin from '..';
import {STEP_COMPLETE} from '../../events';
import {createReadme, createSrcDirectory} from './functionality';
import {getNpmProfileName} from './helpers';
import {property} from '../../utils/obj';
import * as questions from './questions';


/*
  ApplifyProjectPlugin will collect some project meta data and create the
  project's README.md
 */
export default class ApplifyProjectPlugin extends ApplifyPlugin {
  static async build(opts={}) {
    const author = await getNpmProfileName();

    return new ApplifyProjectPlugin(opts, {author});
  }

  constructor(opts, defaults) {
    super('project', questions);

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
      },
      {
        detail: 'faviconUrl',
        value: property(opts, 'logo'),
        default: property(defaults, 'logo')
      }
    ];
  }

  async run(store) {
    await createReadme(store);
    await createSrcDirectory(store);

    store.emit(STEP_COMPLETE, 'run:project');
    store.completedSteps.push('run:project');

    return ()=> Promise.resolve(null);
  }
}
