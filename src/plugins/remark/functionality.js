

export const installRemarkDependencies = async (store)=> {
  const task = {
    type: 'batch',
    description: 'Install remark lint dependencies',
    children: []
  };

  if (store.answers.useRemarkLint) {
    task.children.push({
      type: 'task',
      description: 'install skan-io markdown lint config',
      task: async (storeCtx)=> await storeCtx.packageInstaller.install(
        '@skan-io/remark-config'
      )
    });
  }

  store.addTask(task);
};
