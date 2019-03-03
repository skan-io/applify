"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _privateConfig = require("./private-config.js");

// Plugins config
const config = () => ({
  // TODO eventually infer the step dependencies
  // TODO break into init and run steps
  steps: ['project', 'source', 'package', 'language', 'build', 'deploy', 'test', 'style'],
  branches: ['master', 'dev'],
  gitAccessToken: _privateConfig.gitAccessToken,
  // Operators
  preloader: '@skan-io/applify/preloader',
  tasker: '@skan-io/applify/tasker',
  prompter: '@skan-io/applify/prompter',
  // Step managers
  project: '@skan-io/applify/project-manager',
  source: '@skan-io/applify/source-manager',
  package: '@skan-io/applify/package-manager',
  language: '@skan-io/applify/language-manager',
  build: '@skan-io/applify/build-manager',
  test: '@skan-io/applify/test-manager',
  deploy: '@skan-io/applify/deploy-manager',
  style: '@skan-io/applify/style-manager'
});

var _default = config;
exports.default = _default;