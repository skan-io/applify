"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.printDebugOutput = exports.newLine = exports.printHeadingAndArt = exports.printDim = exports.printWarning = exports.printError = exports.printSuccess = exports.printInfo = void 0;

var _chalk = _interopRequireDefault(require("chalk"));

var _figlet = _interopRequireDefault(require("figlet"));

/* eslint no-console: 0 */
const printInfo = (message, caps = false) => {
  if (message && message !== '') {
    const printMessage = caps ? message.toUpperCase() : message;
    console.log(_chalk.default.blue(printMessage));
  }

  return;
};

exports.printInfo = printInfo;

const printSuccess = (message, caps = false) => {
  if (message && message !== '') {
    const printMessage = caps ? message.toUpperCase() : message;
    console.log(_chalk.default.green(printMessage));
  }

  return;
};

exports.printSuccess = printSuccess;

const printError = (message, caps = false) => {
  if (message && message !== '') {
    const printMessage = caps ? message.toUpperCase() : message;
    console.log(_chalk.default.red(printMessage));
  }

  return;
};

exports.printError = printError;

const printWarning = (message, caps = false) => {
  if (message && message !== '') {
    const printMessage = caps ? message.toUpperCase() : message;
    console.log(_chalk.default.yellow(printMessage));
  }

  return;
};

exports.printWarning = printWarning;

const printDim = (message, colour) => {
  if (message && message !== '') {
    console.log(_chalk.default.dim(_chalk.default[colour](message)));
  }

  return;
}; // Print ascii art and Skan.io heading


exports.printDim = printDim;

const printHeadingAndArt = async () => new Promise((resolve, reject) => {
  _figlet.default.text('APPLIFY!', {
    font: 'ANSI Shadow'
  }, (error, text) => {
    if (error) {
      console.log(`${error}\n\n`);
      reject();
      return;
    }

    console.log();
    console.log();
    console.log();
    console.log(_chalk.default.magenta(text), '\n');
    resolve();
  });
});

exports.printHeadingAndArt = printHeadingAndArt;

const newLine = () => console.log('\n'); // eslint-disable-next-line


exports.newLine = newLine;

const printDebugOutput = outputs => {
  if (outputs.length) {
    console.log(_chalk.default.blue('\n============ DEBUG ============\n'));
  }

  for (const output of outputs) {
    const {
      printInfo: info,
      printWarning: warning,
      printError: error,
      printSuccess: success
    } = output;

    if (info) {
      printInfo(info);
    }

    if (error) {
      printError(error);
    }

    if (success) {
      printSuccess(success);
    }

    if (warning) {
      printWarning(warning);
    }
  }

  if (outputs.length) {
    console.log(_chalk.default.blue('\n===============================\n'));
  }
};

exports.printDebugOutput = printDebugOutput;