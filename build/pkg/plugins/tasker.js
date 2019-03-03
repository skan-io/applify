"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.runTasks = exports.buildTasks = void 0;

var _listr = _interopRequireDefault(require("listr"));

var _events = require("../events");

/*
  The `tasker` operator plugin shall contain a `buildTasks` and `runTasks`
  functions.  Build tasks will be passed an array of task objects (or
  whatever model the plugin builder uses) and will output a conformant
  set of tasks that the `runTasks` function can use and run.
 */
// Standard build task function used by tasker operator on the store.
const buildTasks = (tasks, store, concurrent = false) => {
  const taskList = new _listr.default([], {
    concurrent
  }); // For nested tasks

  for (const task of tasks) {
    if (task.type === 'batch') {
      taskList.add({
        title: task.description,
        task: () => buildTasks(task.children)
      });
    }

    if (task.type === 'task') {
      taskList.add({
        title: task.description,
        // Will be passed the store context at runtime
        task: async ctx => {
          ctx.emit(_events.START_TASK, task); // The default task runner will out put a log object

          const {
            printInfo,
            printWarning,
            printError,
            printSuccess
          } = await task.task(ctx); // Logs to be printed after tasks complete

          if (global.log) {
            ctx.print.push({
              printInfo,
              printWarning,
              printError,
              printSuccess
            });
          }

          ctx.emit(_events.END_TASK, task);
        }
      });
    }
  } // taskList is a Listr class object that will have a `run` function attached


  return taskList;
}; // Standard run task function used by tasker operator on the store.
// Made complicated because we use a Listr object to store tasks
// which is a `runnable` class in itself.


exports.buildTasks = buildTasks;

const runTasks = async (tasks, store) => {
  await tasks.run(store);
};

exports.runTasks = runTasks;