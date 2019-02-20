import {gitAccessToken} from './private-config.js';

// Plugins config
const config = ()=> ({
  // TODO eventually infer the step dependencies
  steps: [
    'project',
    'source',
    'package',
    'language',
    'build',
    'test',
    // 'lint',
    // 'deploy',
    // 'module',
    // 'docs'
  ],

  branches: ['master', 'project-init'],
  gitAccessToken,

  // Operators
  preloader: '@skan-io/applify/preloader',
  tasker: '@skan-io/applify/tasker',
  prompter: '@skan-io/applify/prompter',

  // Step managers
  project: '@skan-io/applify/project-manager',
  source: '@skan-io/applify/source-manager',
  package: '@skan-io/applify/package-manager',
  language: '@skan-io/applify/language-manager',
  build: '@skan-io/applify/build-manager',
  test: '@skan-io/applify/test-manager'
});

export default config;
