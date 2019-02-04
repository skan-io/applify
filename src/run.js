import ApplifyPromptPlugin from './plugins/ApplifyPromptPlugin';
import ApplifyTasksPlugin from './plugins/ApplifyTasksPlugin';
import {addQuestion, addTask} from './utils';

const run = async ()=> {
  const prompter = new ApplifyPromptPlugin();
  const tasker = new ApplifyTasksPlugin();
  const config = {tasks: tasker, prompt: prompter};

  const pipe = {};

  await tasker.init(config, pipe);
  await prompter.init(config, pipe);

  addQuestion(
    async ()=> {
      addTask(
        async ()=> null,
        tasker,
        'Some new task to do',
        'prompt',
        'getPipe'
      );

      await tasker.getPipe().tasks.emit('run');
    },
    prompter,
    'value',
    'Whats my name:',
    'nick',
    'input',
    []
  );

  await prompter.getPipe().prompt.emit('ask');
};

export default run;
