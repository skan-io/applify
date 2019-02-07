import {applifyError} from '../error';
import {PLUGIN_IMPORT_ERROR} from '../error/error-codes';
import {execute} from '../execute';


export const importPlugin = async (store, plugin)=> {
  if (!store.importedPlugins) {
    store.importedPlugins = [];
  }

  if (plugin.startsWith('@skan-io/applify')) {
    const [,, pkg] = plugin.split('/');

    try {
      const importedPkg = await import(`./${pkg}`);
      store.importedPlugins.push(plugin);
      return importedPkg;
    } catch (err) {
      throw applifyError(
        PLUGIN_IMPORT_ERROR.code,
        `${PLUGIN_IMPORT_ERROR.message}: failed with ${err}`
      );
    }

  // Naive implementation (maybe scope packages with @pkg/[pluginName])
  // Then allow local plugins to also be imported (@local/[pluginName])
  } else {
    let importedPkg = null;

    try {
      importedPkg = await import(plugin);
    } catch {
      await execute({
        cmd: `npm i -D ${plugin}`,
        info: `Installing and importing ${plugin}`
      });

      importedPkg = await import(plugin);
    }

    store.importedPlugins.push(plugin);
    return importedPkg;
  }
};
