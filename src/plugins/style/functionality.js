

export const installStorybook = async (store)=> {
  store.addTask({
    type: 'batch',
    description: 'Install storybook dependencies',
    children: [
      {
        type: 'task',
        description: 'install storybook and storybook addons',
        task: async (storeCtx)=> await storeCtx.packageInstaller.install(
          // TODO: make this a skan-io config
          // eslint-disable-next-line
          '@storybook/react @storybook/addons @storybook/addon-storyshots @storybook/addon-links @storybook/addon-knobs @storybook/addon-info @storybook/addon-actions'
        )
      }
    ]
  });
};
