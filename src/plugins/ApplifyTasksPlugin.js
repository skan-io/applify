import EventEmitter from 'events';
import Listr from 'listr';
import BasePlugin from './BasePlugin';

/* eslint no-underscore-dangle: 0 */

/*
  Note all plugins have init(config, pipe), getPipe(), and setPipe(pipe)
  funtions.  They may also have an optional run(context, task)
  function if needed. Any other runnable functions must also include context
  and task as their first parameters.  These extra functions will be checked
  agains the plugins internal `_runnable` map.  Other runnable functions are not
  specifically part of the plugin API so are managed at your own risk.

  The plugins will talk to each other via the various pipe and config
  objects. The pipe can hold event emitters only (mutation is to happen within
  the plugins).
 */

/**
 * An event emitter task runner plugin. Initialise the plugin with a config and
 * pipe object.  The plugin will attach a task EventEmitter that will listen for
 * 'task' and 'run' events and will emit a `complete` event.
 *
 * The 'task' event will add a new task to tasks list.
 * The 'run' event will run all the tasks asynchronously.
 * The 'complete' event will be emitted with task and id when task complete.
 *
 * Example:
 * ```js
 * const taskPlugin = new ApplifyTasksPlugin();
 * const config = {};
 * const pipe = {};
 *
 * await taskPlugin.init(config, pipe);
 *
 * pipe.tasks.emit(
 *   'task', 'some-id', 'Task description', 'SomePlugin', 'runnableFunc', 'arg1'
 * );
 * pipe.tasks.on('complete', (id, result)=> {
 *  if (id === 'some-id') {
 *    // ... do something with result
 *  }
 * });
 * pipe.tasks.emit('run');
 * ```
 *
 * @event task id task
 * @event run
 * @emit comlete id result
 * @extends EventEmitter
 */
class ApplifyTasksPlugin extends BasePlugin {
  constructor(opts) {
    super(opts ? opts.debug : false);

    this.context = {
      success: [],
      fail: [],
      warning: []
    };

    if (opts) {
      this.style = opts.style ? opts.style : 'list';
    } else {
      this.style = 'list';
    }

    if (this.style === 'list') {
      this.tasks = new Listr();
    } else {
      // TODO
      // this.tasks = new Progress();
    }
  }

  /**
   * Will look through the config object for either an exact plugin name
   * or for a field on the config object that matches the plugin name
   *
   * ```js
   * const config = {myPlugin: new SomePlugin()};
   * this.findPlugin('myPlugin'); // returns SomePlugin
   * this.findPlugin('SomePlugin'); // returns SomePlugin
   * ```
   *
   * @private
   * @param  {String} plugin Plugin we are looking for
   * @return {Class}         Plugin class object
   */
  _findPlugin(plugin) {
    for (const key of Reflect.ownKeys(this.config)) {
      // If a config field was specified
      if (key === plugin) {
        return this.config[key];
      }

      // If a specific plugin was specified
      const prop = this.config[key];
      if (typeof prop === key) {
        return prop;
      }
    }

    return null;
  }

  /**
   * Adds a task to the task runner. The task functionality will be
   * defined by the `plugin` (class) and `taskName` (function on the class).
   * It will add an async function that is bound to the plugin it comes from,
   * but has access to the context and task parameters passed from the
   * task runner.  Further arguments are passed to the function from the event.
   *
   * @private
   * @param {String} id          Unique task identifier
   * @param {String} description Displayed description
   * @param {String} plugin      Plugin class name or config field
   * @param {String} taskName    Function on plugin
   * @param {Any} args           Arguments passed to function
   */
  // eslint-disable-next-line max-params
  _addTask(id, description, plugin, taskName, ...args) {
    // Get plugin class from config object
    const pluginObject = this._findPlugin(plugin);

    if (pluginObject) {
      // Bind the plugin function to the plugin
      const func = pluginObject[taskName].bind(pluginObject);

      if (func) {
        const arg = args ? [...args] : [];

        // The task action is what is executed by the task runner,
        // the `func` is the actual task
        const taskAction = async (ctx, tsk)=> {
          // The 'ctx' is passed to the function so that data
          // may trickle between tasks.  By default it will be the
          // `this.context` of this task plugin.  The 'tsk' parameter
          // will enable to function to use `tsk.skip` for example.
          const result = await func(ctx, tsk, ...arg);

          // On task completion the context will be updated and the result
          // of the task will be emitted with the task id
          this.getPipe().tasks.emit('complete', id, result);
        };

        // Tasks are bound to this plugin to access this.pipe
        const taskFunc = (ctx, tsk)=> taskAction.bind(this)(ctx, tsk);

        this.tasks.add({
          title: description,
          task: (ctx, tsk)=> taskFunc.bind(this)(ctx, tsk)
        });

      } else {
        throw new Error(
          `ApplifyTaskError: no function ${taskName} on plugin ${plugin}`
        );
      }
    } else {
      throw new Error(
        `ApplifyTaskError: no ${plugin} in config`
      );
    }
  }

  /**
   * Runs the tasks in sequential order.
   *
   * @private
   * @return {Promise}     All tasks run when resolved
   */
  async _runTasks() {
    try {
      await this.tasks.run(this.context);
    } catch (err) {
      throw new Error(`ApplifyTaskRunnerError: ${err}`);
    }
  }

  /**
   * Initialise the plugin.
   *
   * @param  {Object}  config    Config object containing plugins and data
   * @param  {Object}  [pipe={}] Shared events pipe object
   * @return {Promise}           [description]
   */
  async init(config, pipe={}) {
    this.config = config;
    this.printer = config.printer;
    this.setPipe(pipe);

    if (!pipe.tasks) {
      pipe.tasks = new EventEmitter();
    }

    pipe.tasks.on('task', this._addTask.bind(this));
    pipe.tasks.on('run', this._runTasks.bind(this));

    this.emit('initialised');
  }
}

export default ApplifyTasksPlugin;
