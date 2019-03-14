
// eslint-disable-next-line max-statements
export const installReactReduxDependencies = async (store)=> {
  const task = {
    type: 'batch',
    description: 'Install core react redux dependencies',
    children: []
  };

  task.children.push({
    type: 'task',
    description: 'install react dependencies',
    task: async (storeCtx)=> await storeCtx.packageInstaller.install(
      'react react-dom react-device'
    )
  });

  if (store.answers.useRedux) {
    task.children.push({
      type: 'task',
      description: 'install redux dependencies',
      task: async (storeCtx)=> await storeCtx.packageInstaller.install(
        'react-redux redux redux-responsive redux-thunk'
      )
    });
  }

  if (store.answers.useRouter) {
    task.children.push({
      type: 'task',
      description: 'install router dependencies',
      task: async (storeCtx)=> await storeCtx.packageInstaller.install(
        // eslint-disable-next-line max-len
        `react-router ${storeCtx.answers.useRedux ? 'connected-react-router' : ''}`
      )
    });
  }

  store.addTask(task);
};
