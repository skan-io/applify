"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.handle = void 0;

var _print = require("./print");

var _errors = require("./errors");

/**
 * Used as a try catch for task functions
 */
// eslint-disable-next-line max-statements
const handle = async (func, args) => {
  try {
    const {
      success,
      warning,
      error,
      pipe
    } = await func(args);

    if (global.log) {
      if (success) {
        (0, _print.printSuccess)(success);
      }

      if (warning) {
        (0, _print.printWarning)(warning);
      }

      if (error) {
        (0, _print.printError)(error);
      }
    }

    return pipe;
  } catch (err) {
    if (global.log) {
      (0, _print.printError)(err.message);
    }

    throw (0, _errors.applifyError)(err.code, err.message);
  }
};

exports.handle = handle;