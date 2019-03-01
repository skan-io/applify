import fs from 'fs';
import {join, dirname} from 'path';
import {printWarning} from '../print';
import {applifyError} from '../error';
import {TEMPLATE_COPY_ERROR} from '../error/error-codes';


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

export const parseArrayString = (array)=> {
  let string = '';
  if (array !== 'none' && array !== '') {
    const parts = array.split(',');
    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];
      parts[i] = part.trim();
      string += ` ${part.trim()}`;
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

// eslint-disable-next-line
export const addResourceFromTemplate = (
    filename,
    srcFile=join(dirname(process.argv[1]), 'templates', filename),
    destFile=join(process.cwd(), filename),
    throwOnError=true
)=> {
  try {
    if (!fs.existsSync(dirname(destFile))) {
      fs.mkdirSync(dirname(destFile));
    }

    fs.copyFileSync(srcFile, destFile);
    fs.chmodSync(destFile, '755');

  } catch (err) {
    if (throwOnError) {
      throw applifyError(
        TEMPLATE_COPY_ERROR.code,
        `${TEMPLATE_COPY_ERROR.message}: failed to copy ${srcFile} to ${destFile} with ${err}`
      );
    }
  }
}
