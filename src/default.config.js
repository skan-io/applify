
// Plugins config
const config = ()=> ({
  steps: ['project'],

  // Operators
  tasker: '@skan-io/applify/tasker',
  prompter: '@skan-io/applify/prompter',

  // Managers
  project: '@skan-io/applify/project-manager'
});

export default config;
