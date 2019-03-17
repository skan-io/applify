import ApplifyPlugin from '..';
import {STEP_COMPLETE} from '../../events';
import {writeHtmlFiles} from './functionality';
import {property} from '../../utils/obj';
import * as questions from './questions';

// ApplifyHtmlPlugin.build({
//       main: 'index.html.js',
//       title: 'New Application',
//       twitter: '@blazingshit',
//       copyright: 'blazingshit.com',
//       shareImg: './src/share-img.jpg', // TODO
//       keywords: 'Blazing, Shit, App, React'
//     }),
/*
  ApplifyHtmlPlugin configure the SEO and html components of the project
 */
export default class ApplifyHtmlPlugin extends ApplifyPlugin {
  static async build(opts={}) {
    return new ApplifyHtmlPlugin(opts);
  }

  constructor(opts, defaults) {
    super('html', questions);

    this.scope = [
      {
        detail: 'htmlMain',
        value: property(opts, 'main'),
        default: property(defaults, 'name')
      },
      {
        detail: 'htmlTitle',
        value: property(opts, 'title'),
        default: property(defaults, 'title')
      },
      {
        detail: 'htmlTwitter',
        value: property(opts, 'twitter'),
        default: property(defaults, 'twitter')
      },
      {
        detail: 'htmlCopyright',
        value: property(opts, 'copyright'),
        default: property(defaults, 'copyright')
      },
      {
        detail: 'htmlKeywords',
        value: property(opts, 'keywords'),
        default: property(defaults, 'keywords')
      },
      {
        detail: 'htmlShareImg',
        value: property(opts, 'shareImg'),
        default: property(defaults, 'shareImg')
      }
    ];
  }

  async run(store) {
    await writeHtmlFiles(store);

    store.emit(STEP_COMPLETE, 'run:html');
    store.completedSteps.push('run:html');

    return ()=> Promise.resolve(null);
  }
}
