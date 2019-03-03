"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addResourceFromTemplate = exports.parseArrayString = exports.checkFields = exports.getScopedProject = exports.expectDefined = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _path = require("path");

var _print = require("../print");

var _error = require("../error");

var _errorCodes = require("../error/error-codes");

const expectDefined = path => {
  try {
    return path !== undefined;
  } catch (_unused) {
    return false;
  }
};

exports.expectDefined = expectDefined;

const getScopedProject = (orgScope, projectName) => orgScope === 'none' || orgScope === undefined ? projectName // eslint-disable-next-line max-len
: `@${orgScope.startsWith('@') ? orgScope.substr(1) : orgScope}/${projectName}`;

exports.getScopedProject = getScopedProject;

const checkFields = (store, pluginName, answers, fields) => {
  let restoreSuccess = true;

  for (const answer of answers) {
    if (!expectDefined(store.answers[answer.field])) {
      (0, _print.printWarning)( // eslint-disable-next-line
      `${restoreSuccess ? '\n' : ''}${pluginName} plugin required answers.${answer.field} to be defined - reinitialising...`);
      restoreSuccess = false;
    }
  }

  for (const field of fields) {
    if (!expectDefined(store[field])) {
      (0, _print.printWarning)(`${restoreSuccess ? '\n' : ''}${pluginName} plugin required ${field} to be defined - reinitialising...`);
      restoreSuccess = false;
    }
  }

  return restoreSuccess;
};

exports.checkFields = checkFields;

const parseArrayString = array => {
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
}; // eslint-disable-next-line


exports.parseArrayString = parseArrayString;

const addResourceFromTemplate = (filename, srcFile = (0, _path.join)((0, _path.dirname)(process.argv[1]), 'templates', filename), destFile = (0, _path.join)(process.cwd(), filename), throwOnError = true) => {
  try {
    if (!_fs.default.existsSync((0, _path.dirname)(destFile))) {
      _fs.default.mkdirSync((0, _path.dirname)(destFile));
    }

    _fs.default.copyFileSync(srcFile, destFile);

    _fs.default.chmodSync(destFile, '755');
  } catch (err) {
    if (throwOnError) {
      throw (0, _error.applifyError)(_errorCodes.TEMPLATE_COPY_ERROR.code, `${_errorCodes.TEMPLATE_COPY_ERROR.message}: failed to copy ${srcFile} to ${destFile} with ${err}`);
    }
  }
};

exports.addResourceFromTemplate = addResourceFromTemplate;