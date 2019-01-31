

export const schedulePreInitTasks = ()=> {
  const taskList = [];

  taskList.push({
    type: 'pre-init/applify-dir',
    children: ['resources/check-applify', 'resources/create-applify'],
    args: []
  });

  taskList.push({
    type: 'pre-init/check-aws',
    children: ['credentials/check-aws', 'credentials/create-aws']
  });

  taskList.push({
    type: 'pre-init/prompt-resume',
    children: ['prompt/resume-tasks'],
    args: []
  });
};
