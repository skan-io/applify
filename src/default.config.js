import {gitAccessToken} from './private-config.js';
import ApplifyProjectPlugin from './plugins/project';
import {getNpmProfileName} from './plugins/project/helpers';
import ApplifyPackagePlugin from './plugins/package';

// Plugins config
const config = async ()=> ({
  // TODO eventually infer the step dependencies
  // TODO break into init and run steps
  // steps: [
  //   'project',
  //   // 'source',
  //   // 'package',
  //   // 'language',
  //   // 'build',
  //   // 'deploy',
  //   // 'test',
  //   // 'style',
  //   // 'module',
  //   // 'docs'
  // ],

  branches: ['master', 'dev'],
  gitAccessToken,

  // Operators
  // preloader: '@skan-io/applify/preloader',
  // tasker: '@skan-io/applify/tasker',
  // prompter: '@skan-io/applify/prompter',

  // Plugins order matters
  plugins: [
    // Using plugin.build will allow you to use asynchronous internal defaults
    // Can also pass an async function to build to generate async options
    // on the fly
    await ApplifyProjectPlugin.build(),
    new ApplifyPackagePlugin()
  ]

  // source: '@skan-io/applify/source',
  // package: '@skan-io/applify/package',
  // language: '@skan-io/applify/language',
  // build: '@skan-io/applify/build',
  // test: '@skan-io/applify/test',
  // deploy: '@skan-io/applify/deploy',
  // style: '@skan-io/applify/style'
});

export default config;
