"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.applifyError = void 0;

// Create consistent error messages
const applifyError = (code, message, stack = null) => {
  const stackMsg = stack ? `\n${stack}` : '';
  const error = new Error(`${message} ${stackMsg}`);
  error.code = code;
  return error;
};

exports.applifyError = applifyError;