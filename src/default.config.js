import {gitAccessToken} from './private-config.js';

// Plugins config
const config = ()=> ({
  // TODO eventually infer the step dependencies
  steps: ['project', 'source', 'package'],

  branches: ['master', 'project-init'],
  gitAccessToken,

  // Operators
  preloader: '@skan-io/applify/preloader',
  tasker: '@skan-io/applify/tasker',
  prompter: '@skan-io/applify/prompter',

  // Step managers
  project: '@skan-io/applify/project-manager',
  source: '@skan-io/applify/source-manager',
  package: '@skan-io/applify/package-manager'
});

export default config;
