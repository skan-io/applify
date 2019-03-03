"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createBabelConfig = void 0;

var _utils = require("./utils");

/* eslint max-len: 0*/
const createBabelConfig = store => `const configFunc = require('@skan-io/babel-config-react');

module.exports = {
  ...configFunc.default(
    ${store.answers.useJest ? 'true' : 'false'},
    '${store.answers.nodeTarget}', // Node version to target
    [${(0, _utils.parseArrayString)(store.answers.browserTargets).array.map(target => `'${target}'`).toString()}], // Browser targets
    ['last 1 Chrome versions'], // Development browser targets
    [${(0, _utils.parseArrayString)(store.answers.babelPlugins).string}] // Extra babel plugins
  )
};
`;

exports.createBabelConfig = createBabelConfig;