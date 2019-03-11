import {relative, join} from 'path';
import {applifyError} from '../error';
import {PLUGIN_IMPORT_ERROR} from '../error/codes';


export const importConfig = async (path, babel=false)=> {
  const relativePath = relative(process.argv[1], path);

  if (babel) {
    const config = require(relativePath);
    return config;
  }

  const importedConfig = await import(relativePath);
  return importedConfig;
};
