import {progress} from '../progress';
import {handle} from '../catch';
import {getTask} from './index';


/**
 * Recursively count task and sub task lists
 *
 * task = {
 *  type: String,
 *  children: Array.<task>
 *  args: Array.<arguments>
 * }
 */
const getNumberOfTasks = (taskList)=> {
  let num = 0;

  for (const task of taskList) {
    if (task.children.length > 0) {
      num += getNumberOfTasks(task.taskList);
    }
    num += 1;
  }

  return num;
};

// Recursively yield all the children of a task, then yield the parent
function* flattenTasks(taskList) {
  for (const task of taskList) {
    if (task.children.length > 0) {
      yield * flattenTasks(task.children);
    }
    yield task;
  }
}

/**
 * Progress type task runner will show a progress bar
 * and run all the tasks and sub task of the taskList,
 * updating the progress bar as each task is complete.
 *
 * Returns a function that when run will run the tasks with
 * the passed pipe data and pipe out the result of all the tasks.
 *
 * task = {
 *  type: String,
 *  childTasks: Array.<task>
 *  args: Array.<arguments>
 * }
 */
// eslint-disable-next-line max-statements
export const progressBuilder = (taskList, clear=true)=> async (pipe={})=> {
  const numTasks = getNumberOfTasks(taskList);
  let doneTasks = 0;

  // Initialize the progress display
  progress.init(numTasks);

  // Progress builder just requires a sequential list of tasks
  for (const task of flattenTasks(taskList)) {
    const taskFunction = getTask(task.type);

    if (taskFunction) {
      // Pipe should be immutable
      pipe = {...pipe, ...await handle(taskFunction, pipe, task.args)};
    }

    doneTasks += 1;
    progress.update(doneTasks);
  }

  if (clear) {
    progress.finish();
  }

  return pipe;
};
