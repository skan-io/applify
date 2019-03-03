"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.importPlugin = void 0;

var _interopRequireWildcard2 = _interopRequireDefault(require("@babel/runtime/helpers/interopRequireWildcard"));

var _execute = require("../execute");

var _error = require("../error");

var _errorCodes = require("../error/error-codes");

var _strings = require("../utils/strings");

const importPlugin = async (store, config, role) => {
  if (!store.importedPlugins) {
    store.importedPlugins = [];
  }

  const plugin = config[role];

  if (store.importedPlugins) {
    for (const importedPlugin of store.importedPlugins) {
      if (importedPlugin.role === role && importedPlugin.plugin !== plugin) {
        throw (0, _error.applifyError)(_errorCodes.PLUGINS_OUT_OF_SYNC.code, _strings.singleLine`${_errorCodes.PLUGINS_OUT_OF_SYNC.message}:
             ${' '}failed with '${role}: ${plugin}' (HINT: It seems your plugin config
             ${' '}has changed since you last ran applify init and this will break plugin
             ${' '}dependencies - try running with --reset option)`);
      }
    }
  }

  if (plugin.startsWith('@skan-io/applify')) {
    const [,, pkg] = plugin.split('/');

    try {
      const importedPkg = await Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require(`./${pkg}`)));

      if (!store.importedPlugins.some(pluginObj => pluginObj.role === role)) {
        store.importedPlugins.push({
          role,
          plugin
        });
      }

      store[role] = importedPkg;
      return importedPkg;
    } catch (err) {
      throw (0, _error.applifyError)(_errorCodes.PLUGIN_IMPORT_ERROR.code, `${_errorCodes.PLUGIN_IMPORT_ERROR.message}: failed with ${err}`, err.stack);
    } // Naive implementation (maybe scope packages with @pkg/[pluginName])
    // Then allow local plugins to also be imported (@local/[pluginName])

  } else {
    let importedPkg = null;

    try {
      importedPkg = await Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require(`${plugin}`)));
    } catch (_unused) {
      await (0, _execute.execute)({
        cmd: `npm i -D ${plugin}`,
        info: `Installing and importing ${plugin}`
      });
      importedPkg = await Promise.resolve().then(() => (0, _interopRequireWildcard2.default)(require(`${plugin}`)));
    }

    store.importedPlugins.push({
      role,
      plugin
    });
    store[role] = importedPkg;
    return importedPkg;
  }
};

exports.importPlugin = importPlugin;