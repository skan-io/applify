import EventEmitter from 'events';

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
 * Plugin base class that defines debug state and a pipe.
 *
 * @extends EventEmitter
 */
class BasePlugin extends EventEmitter {
  constructor(debug) {
    super();

    this._pipe = null;

    // This plugin begins with NO runnable functions
    this._runnables = new Map();

    this._debug = debug ? debug : false;

    if (global.log) {
      this._debug = true;
    }
  }

  /**
   * Get the pipe currently shared with this plugin.
   *
   * @return {Object} Sharable pipe object with emitters
   */
  getPipe() {
    return this._pipe;
  }

  /**
   * Set the pipe to be shared by this plugin.
   *
   * @param {Object]} pipe Sharable pipe object with emitters
   */
  setPipe(pipe) {
    this._pipe = pipe;
  }

  /**
   * Get the runnable functions map for this plugin.
   *
   * @return {Map} Map of functions that can be used on this plugin
   */
  getRunnables() {
    return this._runnables;
  }

  /**
   * Set the runnable functions map for this plugin.
   *
   * @param {Map} runnablesMap Map of functions that can be used on this plugin
   */
  setRunnables(runnablesMap) {
    this._runnables = runnablesMap;
  }

  /**
   * Get a runnable function from this plugin.
   *
   * @param  {String} name Name of the runnable function
   * @return {Function}    Function to be run
   */
  getRunnableFunction(name) {
    if (this._runnables.get(name)) {
      return this[name];
    }

    return null;
  }
}

export default BasePlugin;
