import uuidV4 from 'uuid/v4';

/* eslint max-params: 0 */


export const addQuestion = (
    answerCb, prompter, value, question, defaultValue,
    type='input', choices=[]
)=> {
  const id = uuidV4();

  prompter.getPipe().prompt.emit(
    'question', id, 'value', question, type, defaultValue, choices
  );

  if (answerCb) {
    prompter.getPipe().prompt.on('response', (questionId, ...arg)=> {
      if (questionId === id) {
        answerCb(...arg);
      }
    });
  }

  return id;
};


export const addTask = (
    completeCb, tasker, description, plugin, funcName, ...args
)=> {
  const id = uuidV4();

  tasker.getPipe().tasks.emit(
    'task', id, description, plugin, funcName, ...args
  );

  if (completeCb) {
    tasker.getPipe().tasks.on('complete', (taskId, ...arg)=> {
      if (taskId === id) {
        completeCb(...arg);
      }
    });
  }

  return id;
};
