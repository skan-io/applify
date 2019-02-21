import {printWarning} from '../print';


export const expectDefined = (path)=> {
  try {
    return path !== undefined;
  } catch {
    return false;
  }
}

export const getScopedProject = (orgScope, projectName)=> (
  orgScope === 'none' || orgScope === undefined
    ? projectName
    // eslint-disable-next-line max-len
    : `@${orgScope.startsWith('@') ? orgScope.substr(1) : orgScope}/${projectName}`
);

export const checkFields = (store, pluginName, answers, fields)=> {
  let restoreSuccess = true;

  for (const answer of answers) {
    if (!expectDefined(store.answers[answer.field])) {
      printWarning(
        // eslint-disable-next-line
        `${restoreSuccess ? '\n' : ''}${pluginName} plugin required answers.${answer.field} to be defined - reinitialising...`
      );

      restoreSuccess = false;
    }
  }

  for (const field of fields) {
    if (!expectDefined(store[field])) {
      printWarning(
        `${restoreSuccess ? '\n' : ''}${pluginName} plugin required ${field} to be defined - reinitialising...`
      );

      restoreSuccess = false;
    }
  }

  return restoreSuccess;
}

export const parseBabelPlugins = (plugins)=> {
  let string = '';
  if (plugins !== 'none' && plugins !== '') {
    const parts = plugins.split(',');
    for (const part of parts) {
      string += ` ${part}`;
    }

    return {
      array: parts,
      string
    };
  }

  return {
    array: [],
    string: ''
  };
}
