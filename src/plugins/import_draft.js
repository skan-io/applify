



// import {execute} from '../execute';
// import {applifyError} from '../error';
// import {PLUGIN_IMPORT_ERROR, PLUGINS_OUT_OF_SYNC} from '../error/error-codes';
// import {singleLine} from '../utils/strings';
//
//
// export const importPlugin = async (store, config, role)=> {
//   if (!store.importedPlugins) {
//     store.importedPlugins = [];
//   }
//
//   const plugin = config[role];
//
//   for (const importedPlugin of store.importedPlugins) {
//     if (
//       importedPlugin.role === role
//       // If the plugin string is different
//       && importedPlugin.plugin !== plugin
//     ) {
//       throw applifyError(
//         PLUGINS_OUT_OF_SYNC.code,
//         singleLine`${PLUGINS_OUT_OF_SYNC.message}:
//            ${' '}failed with '${role}: ${plugin}' (HINT: It seems your plugin config
//            ${' '}has changed since you last ran applify init and this will break plugin
//            ${' '}dependencies - try running with --reset option)`
//       );
//     }
//   }
//
//   if (plugin.startsWith('@skan-io/applify')) {
//     const [,, pkg] = plugin.split('/');
//
//     try {
//       const importedPkg = await import(`./${pkg}`);
//       if (!store.importedPlugins.some((pluginObj)=> pluginObj.role === role)) {
//         store.importedPlugins.push({role, plugin});
//       }
//       store[role] = importedPkg;
//       return importedPkg;
//     } catch (err) {
//       throw applifyError(
//         PLUGIN_IMPORT_ERROR.code,
//         `${PLUGIN_IMPORT_ERROR.message}: failed with ${err}`,
//         err.stack
//       );
//     }
//
//   // Naive implementation (maybe scope packages with @pkg/[pluginName])
//   // Then allow local plugins to also be imported (@local/[pluginName])
//   } else {
//     let importedPkg = null;
//
//     try {
//       importedPkg = await import(plugin);
//     } catch {
//       await execute({
//         cmd: `npm i -D ${plugin}`,
//         info: `Installing and importing ${plugin}`
//       });
//
//       importedPkg = await import(plugin);
//     }
//
//     store.importedPlugins.push({role, plugin});
//     store[role] = importedPkg;
//     return importedPkg;
//   }
// };
