#!/usr/bin/env node
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.main = void 0;

var _run = _interopRequireDefault(require("./run"));

const main = async process => {
  await (0, _run.default)(process.argv);
};
/* istanbul ignore if */


exports.main = main;

if (require.main === module) {
  main(process);
}